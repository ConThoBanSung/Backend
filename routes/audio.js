/**
 * @swagger
 * /audio/{videoId}:
 *   get:
 *     summary: Lấy luồng âm thanh từ video YouTube
 *     parameters:
 *       - in: path
 *         name: videoId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của video YouTube
 *     responses:
 *       200:
 *         description: Luồng âm thanh thành công
 *         content:
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Không tìm thấy video hoặc định dạng âm thanh
 *       500:
 *         description: Lỗi máy chủ nội bộ
 */



const express = require('express');
const router = express.Router();
const ytdl = require('@distube/ytdl-core');

router.get('/:videoId', async (req, res) => {
  const { videoId } = req.params;

  try {
    const info = await ytdl.getInfo(videoId, {
      requestOptions: {
        headers: {
          'Cookie': 'VISITOR_INFO1_LIVE=734H2Arl0iQ; VISITOR_PRIVACY_METADATA=CgJWThIEGgAgXg%3D%3D; PREF=f7=4100&tz=Asia.Bangkok&f4=10000&f5=20000; LOGIN_INFO=AFmmF2swRQIhAMpdcWgouFbOROqOROfvgHWIQXBdABbTAVgPEzx8RwqcAiAcAkXQ_DDJ7htRIE9QIzB402OwsgDYxRb1Uknx_YFiFA:QUQ3MjNmeTNRRUp5b1ZJRlJJM2pkb2pfLTlEZlpueTlEc2xuUUNKMWJpWHlJWUhRdnhzT1NGUFV1V19acm9NZ2VsbmRoaHA2MkZEQ1pzRDFQeXVzcldKb0RBcjJpbndxMW95Vk55NWRWTTZUSUpZWTBZclNHaUsyelIzMFA2ak1TVjBzQU82eC02WE82RWVma0l4RWZfb0FSREpFZ0FLWXN3; HSID=AB6eex38MWjjs7vb2; SSID=Av10kDNf8QJXn6s9P; APISID=-YqLrebAzpusBPrS/AFOytj2eVn9ig6fok; SAPISID=PJtBoNNmulNU7DZD/AzpW8x4x65jNdmMcl; __Secure-1PAPISID=PJtBoNNmulNU7DZD/AzpW8x4x65jNdmMcl; __Secure-3PAPISID=PJtBoNNmulNU7DZD/AzpW8x4x65jNdmMcl; SID=g.a000mgiAkaZ1OKQgNZ86wR76YFzWSKiON57tqCP_rGOfAE_CbwVbxFrbnu0Kh-SYwed3LO92mwACgYKAasSAQ8SFQHGX2MivQnHOF7nJKEz2e_u2ievoRoVAUF8yKqqZC1R16bcX4z46qhVdyiD0076; __Secure-1PSID=g.a000mgiAkaZ1OKQgNZ86wR76YFzWSKiON57tqCP_rGOfAE_CbwVbqGC0RhAHRfitxxz3G_RNLQACgYKAe4SAQ8SFQHGX2Mief5bEk4cxxElEd4yaj5wURoVAUF8yKp0jJMabPhePU5wzFbraVEY0076; __Secure-3PSID=g.a000mgiAkaZ1OKQgNZ86wR76YFzWSKiON57tqCP_rGOfAE_CbwVbtVvzI_Z6PVrDWpg3HDlk2wACgYKAWQSAQ8SFQHGX2MiyhHJ-U4-S2ZEzkDQXhgOyxoVAUF8yKqeAoyL_gt0MY7gA2uF1j1Y0076; YSC=5npvux4aHjw; __Secure-1PSIDTS=sidts-CjAB4E2dkUYKizGUa3vf_3UpqLjl3GCLcM3h2XanZrO2JmpU4mT_Chi_MYBLDgim9OcQAA; __Secure-3PSIDTS=sidts-CjAB4E2dkUYKizGUa3vf_3UpqLjl3GCLcM3h2XanZrO2JmpU4mT_Chi_MYBLDgim9OcQAA; SIDCC=AKEyXzVdDXoKPBpEKwEaXSB7IASP6KXGXcf5YsuhfKAWmUzapYp3wIkXwP0Xb6EF6-bPCtJXg1w; __Secure-1PSIDCC=AKEyXzVCqkQvx8q2SICZnz4zIalHgbXtqo7RVZL6HruBWFJwTTIDW6-L1VOvLnbqv3TY-qYJRAI; __Secure-3PSIDCC=AKEyXzWr0poITAjonMYbir4rDIxaUs4b8wwdkHjETf5g26a58YhpZjqdrykKdliwOU70O4t_j6Vv'
        }
      }
    });

    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

    if (!format) {
      return res.status(404).send('No suitable audio format found');
    }

    const stream = ytdl(videoId, { format, requestOptions: { headers: { 'Cookie': 'VISITOR_INFO1_LIVE=734H2Arl0iQ; VISITOR_PRIVACY_METADATA=CgJWThIEGgAgXg%3D%3D; PREF=f7=4100&tz=Asia.Bangkok&f4=10000&f5=20000; LOGIN_INFO=AFmmF2swRQIhAMpdcWgouFbOROqOROfvgHWIQXBdABbTAVgPEzx8RwqcAiAcAkXQ_DDJ7htRIE9QIzB402OwsgDYxRb1Uknx_YFiFA:QUQ3MjNmeTNRRUp5b1ZJRlJJM2pkb2pfLTlEZlpueTlEc2xuUUNKMWJpWHlJWUhRdnhzT1NGUFV1V19acm9NZ2VsbmRoaHA2MkZEQ1pzRDFQeXVzcldKb0RBcjJpbndxMW95Vk55NWRWTTZUSUpZWTBZclNHaUsyelIzMFA2ak1TVjBzQU82eC02WE82RWVma0l4RWZfb0FSREpFZ0FLWXN3; HSID=AB6eex38MWjjs7vb2; SSID=Av10kDNf8QJXn6s9P; APISID=-YqLrebAzpusBPrS/AFOytj2eVn9ig6fok; SAPISID=PJtBoNNmulNU7DZD/AzpW8x4x65jNdmMcl; __Secure-1PAPISID=PJtBoNNmulNU7DZD/AzpW8x4x65jNdmMcl; __Secure-3PAPISID=PJtBoNNmulNU7DZD/AzpW8x4x65jNdmMcl; SID=g.a000mgiAkaZ1OKQgNZ86wR76YFzWSKiON57tqCP_rGOfAE_CbwVbxFrbnu0Kh-SYwed3LO92mwACgYKAasSAQ8SFQHGX2MivQnHOF7nJKEz2e_u2ievoRoVAUF8yKqqZC1R16bcX4z46qhVdyiD0076; __Secure-1PSID=g.a000mgiAkaZ1OKQgNZ86wR76YFzWSKiON57tqCP_rGOfAE_CbwVbqGC0RhAHRfitxxz3G_RNLQACgYKAe4SAQ8SFQHGX2Mief5bEk4cxxElEd4yaj5wURoVAUF8yKp0jJMabPhePU5wzFbraVEY0076; __Secure-3PSID=g.a000mgiAkaZ1OKQgNZ86wR76YFzWSKiON57tqCP_rGOfAE_CbwVbtVvzI_Z6PVrDWpg3HDlk2wACgYKAWQSAQ8SFQHGX2MiyhHJ-U4-S2ZEzkDQXhgOyxoVAUF8yKqeAoyL_gt0MY7gA2uF1j1Y0076; YSC=5npvux4aHjw; __Secure-1PSIDTS=sidts-CjAB4E2dkUYKizGUa3vf_3UpqLjl3GCLcM3h2XanZrO2JmpU4mT_Chi_MYBLDgim9OcQAA; __Secure-3PSIDTS=sidts-CjAB4E2dkUYKizGUa3vf_3UpqLjl3GCLcM3h2XanZrO2JmpU4mT_Chi_MYBLDgim9OcQAA; SIDCC=AKEyXzVdDXoKPBpEKwEaXSB7IASP6KXGXcf5YsuhfKAWmUzapYp3wIkXwP0Xb6EF6-bPCtJXg1w; __Secure-1PSIDCC=AKEyXzVCqkQvx8q2SICZnz4zIalHgbXtqo7RVZL6HruBWFJwTTIDW6-L1VOvLnbqv3TY-qYJRAI; __Secure-3PSIDCC=AKEyXzWr0poITAjonMYbir4rDIxaUs4b8wwdkHjETf5g26a58YhpZjqdrykKdliwOU70O4t_j6Vv' } } });

    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.setHeader('Content-Type', 'audio/mpeg');

    stream.pipe(res);
  } catch (error) {
    console.error('Error fetching audio stream:', error.message);
    res.status(500).send('Error processing audio stream');
  }
});

module.exports = router;
