const SystemLogs = require('../models/systemLogs');

class Logger {
    static async log(level, message, source, stack = null, metadata = {}) {
        try {
            await SystemLogs.create({
                level,
                message,
                source,
                stack,
                metadata
            });
        } catch (error) {
            console.error('Failed to save log to database:', error);
        }
    }

    static async error(message, source, error = null, metadata = {}) {
        const stack = error ? error.stack : null;
        await this.log('error', message, source, stack, metadata);
        console.error(`[${source}] ${message}`, error);
    }

    static async warn(message, source, metadata = {}) {
        await this.log('warn', message, source, null, metadata);
        console.warn(`[${source}] ${message}`);
    }

    static async info(message, source, metadata = {}) {
        await this.log('info', message, source, null, metadata);
        console.info(`[${source}] ${message}`);
    }
}

module.exports = Logger;