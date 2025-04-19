// src/models/Booking.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";
import Event from "./event.model";

interface BookingAttributes {
  id: number;
  userId?: number;
  eventId: number;
  bookingDate: Date;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface BookingCreationAttributes
  extends Omit<BookingAttributes, "id" | "bookingDate" | "status"> {
  bookingDate?: Date;
  status?: string;
}

class Booking
  extends Model<BookingAttributes, BookingCreationAttributes>
  implements BookingAttributes
{
  public id!: number;
  public userId!: number;
  public eventId!: number;
  public bookingDate!: Date;
  public status!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    eventId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "events",
        key: "id",
      },
    },
    bookingDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM("confirmed", "cancelled"),
      allowNull: false,
      defaultValue: "confirmed",
    },
  },
  {
    sequelize,
    modelName: "Booking",
    tableName: "bookings",
  }
);

// Associations
Booking.belongsTo(User, { foreignKey: "userId", as: "user" });
Booking.belongsTo(Event, { foreignKey: "eventId", as: "event" });
User.hasMany(Booking, { foreignKey: "userId", as: "bookings" });
Event.hasMany(Booking, { foreignKey: "eventId", as: "bookings" });

export default Booking;
