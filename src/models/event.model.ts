// src/models/Event.ts
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";
import User from "./user.model";

interface EventAttributes {
  id: number;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  capacity: number;
  availableSlots: number;
  image?: string;
  category?: string;
  creatorId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface EventCreationAttributes
  extends Omit<EventAttributes, "id" | "availableSlots"> {
  availableSlots?: number;
}

class Event
  extends Model<EventAttributes, EventCreationAttributes>
  implements EventAttributes
{
  public id!: number;
  public title!: string;
  public description!: string;
  public date!: Date;
  public time!: string;
  public location!: string;
  public capacity!: number;
  public availableSlots!: number;
  public image?: string;
  public category?: string;
  public creatorId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Event.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    availableSlots: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
  },
  {
    sequelize,
    modelName: "Event",
    tableName: "events",
    hooks: {
      beforeCreate: (event: Event) => {
        if (event.availableSlots === undefined) {
          event.availableSlots = event.capacity;
        }
      },
    },
  }
);

// Associations
Event.belongsTo(User, { foreignKey: "creatorId", as: "creator" });

export default Event;
