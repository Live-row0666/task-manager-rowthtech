const crypto = require('crypto');

// OpenSSL EVP_BytesToKey implementation to support legacy crypto.createCipher encrypted passwords in Node.js 22+
function evp_bytestokey(password, keyLen, ivLen) {
    let d = [];
    let d_i = Buffer.alloc(0);
    let count = 0;
    while (count < (keyLen + ivLen)) {
        const md5 = crypto.createHash('md5');
        md5.update(d_i);
        md5.update(password);
        d_i = md5.digest();
        d.push(d_i);
        count += d_i.length;
    }
    const buf = Buffer.concat(d);
    return {
        key: buf.slice(0, keyLen),
        iv: buf.slice(keyLen, keyLen + ivLen)
    };
}

const scryptKeyCache = new Map();
function getScryptKey(secret) {
    if (!secret) return null;
    let key = scryptKeyCache.get(secret);
    if (!key) {
        key = crypto.scryptSync(secret, 'salt', 32);
        scryptKeyCache.set(secret, key);
    }
    return key;
}

const evpKeyIvCache = new Map();
function getEvpKeyIv(input) {
    if (!input) return null;
    const cacheKey = Buffer.isBuffer(input) ? input.toString('hex') : String(input);
    let cached = evpKeyIvCache.get(cacheKey);
    if (!cached) {
        cached = evp_bytestokey(input, 32, 16);
        evpKeyIvCache.set(cacheKey, cached);
    }
    return cached;
}

class EncryptionService {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.secretKey = process.env.ENCRYPTION_SECRET || 'default_encryption_secret_key_minimum_32_chars_long_for_safety';
        this.key = getScryptKey(this.secretKey);
    }

    encrypt(text) {
        if (!text || typeof text !== 'string') return '';
        // Use standard EVP derivation for consistency with existing database passwords
        const scryptKey = getScryptKey(this.secretKey);
        const { key, iv } = getEvpKeyIv(scryptKey);
        const randomIv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return randomIv.toString('hex') + ':' + encrypted;
    }

    decrypt(encryptedText) {
        if (!encryptedText || typeof encryptedText !== 'string') {
            return null;
        }

        const textParts = encryptedText.split(':');
        const hasIv = textParts.length >= 2;
        const randomIv = hasIv ? Buffer.from(textParts[0], 'hex') : null;
        const cipherHex = hasIv ? textParts.slice(1).join(':') : encryptedText;

        const possibleSecrets = [
            this.secretKey,
            'default_encryption_secret_key_minimum_32_chars_long_for_safety',
            'f82b9c7d4a1e3f9c2b84e7d91a6f3b20',
            'your_encryption_secret_key_here_minimum_32_chars',
            process.env.JWT_SECRET
        ].filter(Boolean);

        const uniqueSecrets = [...new Set(possibleSecrets)];

        for (const secret of uniqueSecrets) {
            const scryptKey = getScryptKey(secret);

            // 1. EVP_BytesToKey derivation on scryptKey (exact legacy createCipher format in database)
            try {
                const { key, iv } = getEvpKeyIv(scryptKey);
                const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
                let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                if (decrypted) return decrypted;
            } catch (e) {}

            // 2. EVP_BytesToKey derivation on secret string
            try {
                const { key, iv } = getEvpKeyIv(secret);
                const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
                let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
                decrypted += decipher.final('utf8');
                if (decrypted) return decrypted;
            } catch (e) {}

            // 3. Direct createDecipheriv with randomIv and scryptKey (for modern standard encrypted entries)
            if (hasIv && randomIv && randomIv.length === 16) {
                try {
                    const decipher = crypto.createDecipheriv(this.algorithm, scryptKey, randomIv);
                    let decrypted = decipher.update(cipherHex, 'hex', 'utf8');
                    decrypted += decipher.final('utf8');
                    if (decrypted) return decrypted;
                } catch (e) {}
            }
        }

        return null;
    }

    compare(plainText, encryptedText) {
        if (!plainText || !encryptedText) return false;

        // 1. Plain text comparison
        if (plainText === encryptedText) {
            return true;
        }

        // 2. Decryption comparison
        try {
            const decrypted = this.decrypt(encryptedText);
            if (decrypted !== null && plainText === decrypted) {
                return true;
            }
        } catch (error) {
            // Ignore
        }

        // 3. Bcrypt comparison fallback
        try {
            const bcrypt = require('bcryptjs');
            if (encryptedText.startsWith('$2a$') || encryptedText.startsWith('$2b$') || encryptedText.startsWith('$2y$')) {
                return bcrypt.compareSync(plainText, encryptedText);
            }
        } catch (error) {
            // Ignore
        }

        return false;
    }
}

module.exports = new EncryptionService();