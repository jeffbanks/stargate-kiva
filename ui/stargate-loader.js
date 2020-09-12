const _ = require("lodash");
const { once } = require('events');
const { createReadStream } = require('fs');
const { createInterface } = require('readline');

const processAll = async (stargateAPI, docRootPath, id) => {
    try {

        const rs = createInterface({
            input: createReadStream('kiva-data-single.json'),
            crlfDelay: Infinity
        });
        rs.on('line', (line) => {
            if (line && line.length > 0) {
                stargateAPI.put(docRootPath + `/${id}`, line);
            }
        });
        await once(rs, 'close');
    } catch (err) {
        console.error(err);
    }
};

const processSingleLine = async (stargateAPI, docRootPath, id) => {

    try {
        let firstLine = undefined;
        const rs = createInterface({
            input: createReadStream('kiva-data-single.json'),
            crlfDelay: Infinity
        });

        rs.on('line', (line) => {
            if (!firstLine && line && line.length > 0) {
                firstLine = line;
            }
        });
        await once(rs, 'close');
        return firstLine;
    } catch (err) {
        console.error(err);
    }

};

module.exports = { processSingleLine, processAll };
