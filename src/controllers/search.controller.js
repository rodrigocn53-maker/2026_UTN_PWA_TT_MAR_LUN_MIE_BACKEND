import searchService from "../services/search.service.js"

class SearchController {
    async globalSearch(req, res, next) {
        try {
            const user_id = req.user.id
            const { q } = req.query

            const results = await searchService.globalSearch(user_id, q)

            res.status(200).json({
                ok: true,
                status: 200,
                message: 'Resultados de búsqueda obtenidos',
                data: results
            })
        } catch (error) {
            next(error)
        }
    }
}

const searchController = new SearchController()
export default searchController
