import { Request, Response } from "express";
import { Op } from "sequelize";
import Event from "../models/event.model";
import Booking from "../models/booking.model";
import { UserRole } from "../models/user.model";
import sequelize from "../config/database";

// @desc    Get event statistics
// @route   GET /api/stats/events
// @access  Private (Admin)
export const getEventStats = async (req: Request, res: Response) => {
  try {
    const totalEvents = await Event.count();
    const upcomingEvents = await Event.count({
      where: {
        date: {
          [Op.gte]: new Date(),
        },
      },
    });
    const pastEvents = await Event.count({
      where: {
        date: {
          [Op.lt]: new Date(),
        },
      },
    });

    // Get events by category
    const eventsByCategory = await Event.findAll({
      attributes: [
        "category",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["category"],
    });

    // Get events by location
    const eventsByLocation = await Event.findAll({
      attributes: [
        "location",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["location"],
    });

    res.status(200).json({
      success: true,
      data: {
        totalEvents,
        upcomingEvents,
        pastEvents,
        eventsByCategory,
        eventsByLocation,
      },
    });
  } catch (error: any) {
    console.error("Get event stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get booking statistics
// @route   GET /api/stats/bookings
// @access  Private (Admin)
export const getBookingStats = async (req: Request, res: Response) => {
  try {
    const totalBookings = await Booking.count();
    const confirmedBookings = await Booking.count({
      where: {
        status: "confirmed",
      },
    });
    const cancelledBookings = await Booking.count({
      where: {
        status: "cancelled",
      },
    });

    // Get bookings by month
    const bookingsByMonth = await Booking.findAll({
      attributes: [
        [sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt")), "month"],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt"))],
      order: [[sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt")), "ASC"]],
    });

    // Get most popular events
    const popularEvents = await Booking.findAll({
      attributes: [
        "eventId",
        [sequelize.fn("COUNT", sequelize.col("id")), "bookingCount"],
      ],
      include: [
        {
          model: Event,
          attributes: ["title", "category"],
        },
      ],
      group: ["eventId", "Event.id"],
      order: [[sequelize.literal("bookingCount"), "DESC"]],
      limit: 5,
    });

    res.status(200).json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        bookingsByMonth,
        popularEvents,
      },
    });
  } catch (error: any) {
    console.error("Get booking stats error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}; 