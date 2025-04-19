// src/controllers/event.controller.ts
import { Request, Response } from "express";
import { Op } from "sequelize";
import User from "../models/user.model";
import Event from "../models/event.model";

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Admin)
export const createEvent = async (req: Request, res: Response) => {
  try {
    // Add creator ID to event data
    const eventData = {
      ...req.body,
      creatorId: req.user?.id,
      availableSlots: req.body.capacity,
    };

    // Create event
    const event = await Event.create(eventData);

    res.status(201).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Create event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req: Request, res: Response) => {
  try {
    const { category, location, date, sort } = req.query;

    // Build filter object
    const filter: any = {};

    // Add filters if provided
    if (category) {
      filter.category = category;
    }

    if (location) {
      filter.location = location;
    }

    if (date) {
      filter.date = date;
    }

    // Filter to get only upcoming events
    filter.date = {
      [Op.gte]: new Date(),
    };

    // Build sort options
    let order: any = [["date", "ASC"]]; // Default sorting

    if (sort === "title") {
      order = [["title", "ASC"]];
    } else if (sort === "location") {
      order = [["location", "ASC"]];
    }

    // Find events
    const events = await Event.findAll({
      where: filter,
      order,
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["name"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error: any) {
    console.error("Get events error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["name"],
        },
      ],
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Get event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private (Admin)
export const updateEvent = async (req: Request, res: Response) => {
  try {
    let event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ensure the event belongs to the user or user is admin
    if (event.creatorId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this event",
      });
    }

    // Update event
    await event.update(req.body);

    // Refresh event data
    event = await Event.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error: any) {
    console.error("Update event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private (Admin)
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ensure the event belongs to the user or user is admin
    if (event.creatorId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this event",
      });
    }

    // Delete event
    await event.destroy();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    console.error("Delete event error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Get event bookings
// @route   GET /api/events/:id/bookings
// @access  Private (Admin)
export const getEventBookings = async (req: Request, res: Response) => {
  try {
    const event = await Event.findByPk(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Ensure the event belongs to the user or user is admin
    if (event.creatorId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view bookings for this event",
      });
    }

    // Get bookings
    // @ts-ignore
    const bookings = await event.getBookings({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error: any) {
    console.error("Get event bookings error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
