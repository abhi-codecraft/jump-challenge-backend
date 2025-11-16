import { DataTypes } from "sequelize";
import { sequelize } from "./index.js";

export const User = sequelize.define("users", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  picture: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  google_access_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  google_refresh_token: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});
