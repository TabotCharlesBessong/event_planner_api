import sequelize from "./database"

const DbInitialize = async () => {
  try {
    await sequelize.authenticate()
  } catch (error) {
    
  }
}