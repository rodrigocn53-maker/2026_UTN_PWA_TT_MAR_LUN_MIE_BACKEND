import { Router } from "express"
import searchController from "../controllers/search.controller.js"
import authMiddleware from "../middlewares/authMiddleware.js"

const searchRouter = Router()

searchRouter.use(authMiddleware)

searchRouter.get(
    '/',
    searchController.globalSearch
)

export default searchRouter
