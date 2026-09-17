const crypto = require('crypto');

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.secretKey = process.env.ENCRYPTION_SECRET || 'default_encryption_secret_key_minimum_32_chars_long_for_safety';
        if (!this.secretKey) {
            throw new Error('ENCRYPTION_SECRET environment variable is not set');
        }
        this.key = crypto.scryptSync(this.secretKey, 'salt', 32);
    }

    encrypt(text) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipher(this.algorithm, this.key);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return iv.toString('hex') + ':' + encrypted;
    }

    decrypt(encryptedText) {
        const textParts = encryptedText.split(':');
        const iv = Buffer.from(textParts.shift(), 'hex');
        const encrypted = textParts.join(':');
        const decipher = crypto.createDecipher(this.algorithm, this.key);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }

    compare(plainText, encryptedText) {
        console.log(plainText, encryptedText)
        try {
            const decrypted = this.decrypt(encryptedText);
            return plainText === decrypted;
        } catch (error) {
            return false;
        }
    }
}

module.exports = new EncryptionService();