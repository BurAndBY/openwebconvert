const express = require('express');
const sharp = require('sharp');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const multer = require('multer');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

const img_supported = ['jpg', 'jpeg', 'png', 'webp', 'svg', 'gif'];
const aud_supported = ['mp3', 'ogg', 'wav', 'flac'];
const vid_supported = ['mp4', 'avi', 'mkv'];

app.post('/convert', upload.single('file'), async (req, res) => {
    const { format } = req.body;
    const { path: filePath } = req.file;
	const outputPath = `converted/${req.file.filename}.${format}`;

	//Image conversion using sharp
	if (img_supported.includes(format)) {
		try {
			await sharp(filePath)
				.toFormat(format)
				.toFile(outputPath);

			fs.unlinkSync(filePath);

			res.download(outputPath, (err) => {
				if (err) {
					console.error(err);
					res.status(500).send({ error: 'Something went wrong' });
				} else {
					fs.unlinkSync(outputPath);
				}
			});
		} catch (error) {
			console.error(error);
			res.status(500).send({ error: 'Something went wrong' });
		}
	}
	
	// Audio conversion using fluent-ffmpeg
	else if (aud_supported.includes(format)) {
		ffmpeg(filePath)
			.output(outputPath)
			.on('end', () => {
				fs.unlinkSync(filePath);
				res.download(outputPath, (err) => {
					if (err) {
						console.error(err);
						res.status(500).send({ error: 'Something went wrong' });
					} else {
						fs.unlinkSync(outputPath);
					}
				});
			})
			.on('error', (err) => {
				console.error(err);
				res.status(500).send({ error: 'Something went wrong' });
			})
			.run();
	}
	else if (vid_supported.includes(format)) {
		ffmpeg(filePath)
        .output(outputPath)
        .on('end', () => {
            fs.unlinkSync(filePath);

            res.download(outputPath, (err) => {
                if (err) {
                    console.error(err);
                    res.status(500).send({ error: 'Something went wrong' });
                } else {
                    fs.unlinkSync(outputPath);
                }
            });
        })
        .on('error', (err) => {
            console.error(err);
            res.status(500).send({ error: 'Something went wrong' });
        })
        .run();
	}
	else
	{
		console.log(format);
		return res.status(400).send({ error: 'Invalid format' });
	}
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
})

app.listen(3000, () => console.log('Server is running on port 3000'));
