const datastore = require('@google-cloud/datastore')();

class Memory {
    constructor(kind) {
        this.kind = kind;
    }

    getLatestPost() {
        return new Promise((resolve, reject) => {
            const query = datastore
                .createQuery(this.kind)
                .order('createdAt', { descending: true })
                .limit(1);

            datastore.runQuery(query, (err, entities) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(entities[0] || null);
            });
        });
    }

    insertPosts(posts) {
        const entities = posts.map(p => this.createDatastoreEntity(this.kind, p));
        return new Promise((resolve, reject) => {
            datastore.save(entities, (err, resp) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(resp);
            });
        });
    }

    createDatastoreEntity(kind, post) {
        return {
            key: datastore.key([kind, post.id]),
            data: post,
            excludeFromIndexes: ['description', 'thumbnailUrl'],
        };
    }
}

module.exports = Memory;