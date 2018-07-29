const express = require('express');
const request = require('request-promise');
const app = express();
const Memory = require('./memory');
const Pixiv = require('pixiv-app-api');

let pixiv = null;
let pixivUserId = null;
const memory = new Memory('Pixlack');
const slackWebhookUrl = process.env.PIXLACK_SLACK_WEBHOOK_URL;

app.get('/', async (req, res) => {
    const origPosts = (await getFollowingOrigPosts(pixiv, pixivUserId)).reverse();
    const latestPost = await memory.getLatestPost();
    console.log('latestPost:', latestPost);

    const newOrigPosts = origPosts.filter(op => !latestPost || new Date(op.createDate) > latestPost.createdAt);
    console.log('new orig posts: ', newOrigPosts);

    let newPosts = [];
    for (let i = 0; i < newOrigPosts.length; i++) {
        const thumbUrl = await createYabumiThumbnailUrl(newOrigPosts[i]);
        const post = createPost(newOrigPosts[i], thumbUrl);
        newPosts.push(post);
    }
    await memory.insertPosts(newPosts);
    newPosts.forEach(np => notifyToSlack(slackWebhookUrl, np));
    res.json(newPosts);
});

(async () => {
    pixiv = new Pixiv();
    try {
        const authInfo = await pixiv.login(process.env.PIXLACK_USERNAME, process.env.PIXLACK_PASSWORD);
        pixivUserId = authInfo['user']['id'];
    } catch (err) {
        console.error('pixiv login failed...', err);
        return;
    }

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
        console.log(`listening on 0.0.0.0:${PORT}...`);
    });
})();

async function getFollowingOrigPosts(pixiv, userId) {
    const res = await pixiv.illustFollow(userId);
    return res['illusts'];
}

function createPost(orig, thumbnailUrl) {
    return {
        id: orig.id,
        title: orig.title,
        username: orig.user.name,
        tags: orig.tags.map(t => t.name),
        createdAt: new Date(orig.createDate),
        thumbnailUrl: thumbnailUrl,
        description: orig.caption,
    };
}

async function createYabumiThumbnailUrl(origPost) {
    const origThumbUrl = origPost.imageUrls.squareMedium;
    const pixivHeaders = {
        'Referer': 'https://www.pixiv.net/manage/illusts/'
    };
    const thumbImageBody = request.get(origThumbUrl, { headers: pixivHeaders });
    const yabumiHeaders = {
        'User-Agent': 'pixlack',
    }
    const yabumiRes = JSON.parse(await request.post('https://yabumi.cc/api/images.json', {
        headers: yabumiHeaders,
        formData: { imagedata: thumbImageBody }
    }));
    return `https://yabumi.cc/api/images/${yabumiRes['id']}.png`;
}

function notifyToSlack(webhookUrl, post) {
    const slackPayload = toSlackPayload(post);
    return request.post(webhookUrl, { json: slackPayload });
}

function toSlackPayload(post) {
    const attachment = {
        fallback: `[pixiv]${post.title} by ${post.username}`,
        color: '#4385B7',
        title: post.title,
        title_link: `https://www.pixiv.net/member_illust.php?mode=medium&illust_id=${post.id}`,
        image_url: post.thumbnailUrl,
    };
    return {
        username: post.username,
        icon_url: 'http://winapp.jp/wp/wp-content/uploads/2012/11/pixiv-icon.png',
        attachments: [attachment],
    };
}