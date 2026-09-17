const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class BackupService {
    constructor() {
        this.backupDir = path.join(__dirname, '../backups');
        this.ensureBackupDir();
    }

    ensureBackupDir() {
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createDatabaseBackup() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFileName = `backup-${timestamp}.gz`;
            const backupPath = path.join(this.backupDir, backupFileName);
            
            const mongoUri = process.env.MONGODB_URI;
            const dbName = mongoUri.split('/').pop().split('?')[0];
            
            const command = `mongodump --uri="${mongoUri}" --archive="${backupPath}" --gzip`;
            
            return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Backup failed:', error);
                        reject(error);
                        return;
                    }
                    
                    console.log('Backup created successfully:', backupPath);
                    resolve({
                        success: true,
                        backupPath,
                        fileName: backupFileName,
                        timestamp: new Date()
                    });
                });
            });
        } catch (error) {
            console.error('Error creating backup:', error);
            throw error;
        }
    }

    async restoreDatabase(backupFileName) {
        try {
            const backupPath = path.join(this.backupDir, backupFileName);
            
            if (!fs.existsSync(backupPath)) {
                throw new Error('Backup file not found');
            }
            
            const mongoUri = process.env.MONGODB_URI;
            const command = `mongorestore --uri="${mongoUri}" --archive="${backupPath}" --gzip --drop`;
            
            return new Promise((resolve, reject) => {
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        console.error('Restore failed:', error);
                        reject(error);
                        return;
                    }
                    
                    console.log('Database restored successfully');
                    resolve({
                        success: true,
                        restoredFrom: backupFileName,
                        timestamp: new Date()
                    });
                });
            });
        } catch (error) {
            console.error('Error restoring database:', error);
            throw error;
        }
    }

    async listBackups() {
        try {
            const files = fs.readdirSync(this.backupDir);
            const backups = files
                .filter(file => file.startsWith('backup-') && file.endsWith('.gz'))
                .map(file => {
                    const stats = fs.statSync(path.join(this.backupDir, file));
                    return {
                        fileName: file,
                        size: stats.size,
                        created: stats.birthtime
                    };
                })
                .sort((a, b) => b.created - a.created);
            
            return backups;
        } catch (error) {
            console.error('Error listing backups:', error);
            throw error;
        }
    }

    async deleteOldBackups(daysToKeep = 30) {
        try {
            const files = fs.readdirSync(this.backupDir);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            let deletedCount = 0;
            
            files.forEach(file => {
                if (file.startsWith('backup-') && file.endsWith('.gz')) {
                    const filePath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filePath);
                    
                    if (stats.birthtime < cutoffDate) {
                        fs.unlinkSync(filePath);
                        deletedCount++;
                        console.log(`Deleted old backup: ${file}`);
                    }
                }
            });
            
            return { deletedCount };
        } catch (error) {
            console.error('Error deleting old backups:', error);
            throw error;
        }
    }
}

module.exports = new BackupService();