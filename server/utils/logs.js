const Log = require('../models/logs');

const createLog = async (data) => {
    const log = new Log(data);
    await log.save();
}
module.exports = { createLog };