/**
 * @swagger
 * /search:
 *   get:
 *     summary: Tìm kiếm video trên YouTube
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Từ khóa tìm kiếm video
 *     responses:
 *       200:
 *         description: Danh sách video tìm được
 *         content:
 *           application/json:
 *             schema:
 *               type: object 
 *               properties:
 *                 items: 
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: object
 *                         properties:
 *                           videoId:
 *                             type: string
 *                             description: ID của video
 *                       snippet:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                             description: Tiêu đề video
 *                           description:
 *                             type: string
 *                             description: Mô tả video
 *                           thumbnails:
 *                             type: object
 *                             properties:
 *                               default:
 *                                 type: object
 *                                 properties:
 *                                   url:
 *                                     type: string
 *                                     description: URL ảnh thumbnail mặc định
 *                           channelTitle:
 *                             type: string
 *                             description: Tên kênh
 *       500:
 *         description: Internal Server Error - Lỗi xảy ra trên server
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/', async (req, res) => {
  const { query } = req.query;
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        key: 'AIzaSyAnGyAlc4EJSmG5XeTarwzeBsXDFX4f92o'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
