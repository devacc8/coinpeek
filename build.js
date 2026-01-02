#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class ExtensionBuilder {
    constructor() {
        this.sourceDir = process.cwd();
        this.buildDir = path.join(this.sourceDir, 'build');
        this.distDir = path.join(this.sourceDir, 'dist');
        
        // Files and directories to exclude from build
        this.excludePatterns = [
            'build.js',
            'package.json',
            'package-lock.json',
            'node_modules',
            '.git',
            '.gitignore',
            'CLAUDE.md',
            'CHANGELOG.md', 
            'README.md',
            'PRIVACY_POLICY.md',
            'CONTRIBUTING.md',
            'LICENSE',
            'TECHNICAL_DOCS.md',
            'to-do.txt',
            'dev-tools',
            'doc_internal',
            '.claude',
            'build',
            'dist'
        ];
        
        this.requiredManifestFields = [
            'name',
            'version', 
            'manifest_version',
            'description'
        ];
    }

    // Create build and dist directories
    createDirectories() {
        console.log('📁 Creating directories...');
        
        if (fs.existsSync(this.buildDir)) {
            fs.rmSync(this.buildDir, { recursive: true });
        }
        if (fs.existsSync(this.distDir)) {
            fs.rmSync(this.distDir, { recursive: true });
        }
        
        fs.mkdirSync(this.buildDir, { recursive: true });
        fs.mkdirSync(this.distDir, { recursive: true });
        
        console.log('✅ Directories created');
    }

    // Check if file/directory should be excluded
    shouldExclude(fileName) {
        return this.excludePatterns.some(pattern => {
            if (fileName === pattern) return true;
            if (fileName.startsWith(pattern + '/')) return true;
            return false;
        });
    }

    // Copy files recursively, excluding unwanted files
    copyFiles(srcDir, destDir) {
        const items = fs.readdirSync(srcDir);
        
        for (const item of items) {
            if (this.shouldExclude(item)) {
                console.log(`⏭️  Skipping: ${item}`);
                continue;
            }
            
            const srcPath = path.join(srcDir, item);
            const destPath = path.join(destDir, item);
            const stat = fs.statSync(srcPath);
            
            if (stat.isDirectory()) {
                fs.mkdirSync(destPath, { recursive: true });
                this.copyFiles(srcPath, destPath);
            } else {
                fs.copyFileSync(srcPath, destPath);
                console.log(`📄 Copied: ${item}`);
            }
        }
    }

    // Disable debug mode in constants.js
    disableDebugMode() {
        console.log('🔧 Disabling debug mode...');
        
        const constantsPath = path.join(this.buildDir, 'config', 'constants.js');
        
        if (!fs.existsSync(constantsPath)) {
            console.log('⚠️  Warning: constants.js not found');
            return;
        }
        
        let content = fs.readFileSync(constantsPath, 'utf8');
        
        // Replace DEBUG.ENABLED: true with DEBUG.ENABLED: false
        content = content.replace(
            /DEBUG:\s*\{[\s\S]*?ENABLED:\s*true/g,
            match => match.replace('ENABLED: true', 'ENABLED: false')
        );
        
        // Also disable other debug flags
        content = content.replace(/LOG_API_CALLS:\s*true/g, 'LOG_API_CALLS: false');
        content = content.replace(/LOG_USER_ACTIONS:\s*true/g, 'LOG_USER_ACTIONS: false');
        
        fs.writeFileSync(constantsPath, content);
        console.log('✅ Debug mode disabled');
    }

    // Validate manifest.json
    validateManifest() {
        console.log('🔍 Validating manifest.json...');
        
        const manifestPath = path.join(this.buildDir, 'manifest.json');
        
        if (!fs.existsSync(manifestPath)) {
            throw new Error('❌ manifest.json not found');
        }
        
        let manifest;
        try {
            const content = fs.readFileSync(manifestPath, 'utf8');
            manifest = JSON.parse(content);
        } catch (error) {
            throw new Error(`❌ Invalid JSON in manifest.json: ${error.message}`);
        }
        
        // Check required fields
        for (const field of this.requiredManifestFields) {
            if (!manifest[field]) {
                throw new Error(`❌ Missing required field in manifest.json: ${field}`);
            }
        }
        
        // Check manifest version
        if (manifest.manifest_version !== 3) {
            console.log('⚠️  Warning: Not using Manifest V3');
        }
        
        // Check if icon files exist
        if (manifest.icons) {
            for (const [size, iconPath] of Object.entries(manifest.icons)) {
                const fullIconPath = path.join(this.buildDir, iconPath);
                if (!fs.existsSync(fullIconPath)) {
                    throw new Error(`❌ Icon file not found: ${iconPath}`);
                }
            }
        }
        
        console.log('✅ Manifest validation passed');
        return manifest;
    }

    // Create ZIP archive
    async createArchive(manifest) {
        console.log('📦 Creating ZIP archive...');
        
        const archiveName = `coinpeek-v${manifest.version}.zip`;
        const archivePath = path.join(this.distDir, archiveName);
        
        return new Promise((resolve, reject) => {
            const output = fs.createWriteStream(archivePath);
            const archive = archiver('zip', { zlib: { level: 9 } });
            
            output.on('close', () => {
                const sizeKB = Math.round(archive.pointer() / 1024);
                console.log(`✅ Archive created: ${archiveName} (${sizeKB} KB)`);
                resolve(archivePath);
            });
            
            archive.on('error', (err) => {
                reject(err);
            });
            
            archive.pipe(output);
            archive.directory(this.buildDir, false);
            archive.finalize();
        });
    }

    // Main build process
    async build() {
        try {
            console.log('🚀 Starting build process...\n');
            
            this.createDirectories();
            
            console.log('\n📂 Copying files...');
            this.copyFiles(this.sourceDir, this.buildDir);
            
            console.log('\n');
            this.disableDebugMode();
            
            console.log('\n');
            const manifest = this.validateManifest();
            
            console.log('\n');
            const archivePath = await this.createArchive(manifest);
            
            console.log('\n🎉 Build completed successfully!');
            console.log(`📦 Archive: ${path.basename(archivePath)}`);
            console.log(`📁 Location: ${this.distDir}`);
            console.log('\n📋 Next steps:');
            console.log('   1. Test the extension by loading unpacked from build/ folder');
            console.log('   2. Upload the ZIP file to Chrome Web Store');
            
        } catch (error) {
            console.error('\n❌ Build failed:', error.message);
            process.exit(1);
        }
    }
}

// Run build if script is executed directly
if (require.main === module) {
    const builder = new ExtensionBuilder();
    builder.build();
}

module.exports = ExtensionBuilder;