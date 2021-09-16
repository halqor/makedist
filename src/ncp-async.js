import ncp from 'ncp';

async function ncpAsync(src, dst) {
    return new Promise((resolve, reject) => {
        try {
            ncp.ncp(src, dst, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}

export default ncpAsync;
