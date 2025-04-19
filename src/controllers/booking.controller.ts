// src/controllers/booking.controller.ts
import { Request, Response } from 'express';
import sequelize from '../config/database';
import Booking from '../models/booking.model';
import Event from '../models/event.model';

// @desc    Book an event
// @route   POST /api/bookings
// @access  Private (Client)
export const bookEvent = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.body;
    const userId = req.user?.id;

    // Start transaction
    const transaction = await sequelize.transaction();

    try {
      // Check if event exists
      const event = await Event.findByPk(eventId, { transaction });

      if (!event) {
        await transaction.rollback();
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      // Check if there are available slots
      if (event.availableSlots <= 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Event is fully booked",
        });
      }

      // Check if user has already booked this event
      const existingBooking = await Booking.findOne({
        where: {
          userId,
          eventId,
          status: "confirmed",
        },
        transaction,
      });

      if (existingBooking) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "You have already booked this event",
        });
      }

      // Create booking
      const booking = await Booking.create(
        {
          userId,
          eventId,
        },
        { transaction }
      );
      event.availableSlots -= 1;
      await event.save({ transaction });

      // Commit transaction
      await transaction.commit();

      // Get booking with relation data
      const completeBooking = await Booking.findByPk(booking.id, {
        include: [
          {
            model: Event,
            as: "event",
            attributes: ["id", "title", "date", "time", "location"],
          },
        ],
      });

      res.status(201).json({
        success: true,
        data: completeBooking,
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error: any) {
    console.error("Book event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};