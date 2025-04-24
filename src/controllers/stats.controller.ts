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
    // Get basic booking counts
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
        [sequelize.fn("DATE_TRUNC", "month", sequelize.col("Booking.created_at")), "month"],
        [sequelize.fn("COUNT", sequelize.col("Booking.id")), "count"],
      ],
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("Booking.created_at"))],
      order: [[sequelize.fn("DATE_TRUNC", "month", sequelize.col("Booking.created_at")), "ASC"]],
    });

    // Get most popular events
    const popularEvents = await Booking.findAll({
      attributes: [
        [sequelize.col("event.id"), "eventId"],
        [sequelize.fn("COUNT", sequelize.col("Booking.id")), "bookingCount"],
        [sequelize.col("event.title"), "title"],
        [sequelize.col("event.category"), "category"],
      ],
      include: [
        {
          model: Event,
          as: "event",
          attributes: [],
        },
      ],
      group: ["event.id", "event.title", "event.category"],
      order: [[sequelize.fn("COUNT", sequelize.col("Booking.id")), "DESC"]],
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