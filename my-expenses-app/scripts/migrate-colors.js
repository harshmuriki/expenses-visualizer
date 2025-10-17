#!/usr/bin/env node

/**
 * Color Migration Script
 * 
 * This script helps migrate hardcoded colors to the centralized color system.
 * It provides mappings and suggestions for common color replacements.
 */

const fs = require('fs');
const path = require('path');

// Color mappings from hardcoded to theme colors
const colorMappings = {
    // Primary colors
    '#80A1BA': 'primary-500',
    '#6B8BA4': 'primary-600',
    '#5a7a93': 'primary-700',
    '#4a6a82': 'primary-800',
    '#3a5a71': 'primary-900',

    // Secondary colors
    '#91C4C3': 'secondary-500',
    '#7AAFAD': 'secondary-600',
    '#6a9a98': 'secondary-700',
    '#5a8a83': 'secondary-800',
    '#4a7a6e': 'secondary-900',

    // Accent colors
    '#B4DEBD': 'accent-500',
    '#9AC9A4': 'accent-600',
    '#80b48b': 'accent-700',
    '#669f72': 'accent-800',
    '#4c8a59': 'accent-900',

    // Common slate colors
    '#0f172a': 'background-primary',
    '#1e293b': 'background-secondary',
    '#334155': 'background-tertiary',
    '#475569': 'border-primary',
    '#64748b': 'border-secondary',
    '#94a3b8': 'text-tertiary',
    '#cbd5e1': 'text-secondary',
    '#ffffff': 'text-primary',

    // Semantic colors
    '#10b981': 'success',
    '#f59e0b': 'warning',
    '#ef4444': 'error',
    '#3b82f6': 'info',
};

// Tailwind class mappings
const tailwindMappings = {
    // Background classes
    'bg-slate-900': 'bg-background-primary',
    'bg-slate-800': 'bg-background-secondary',
    'bg-slate-700': 'bg-background-tertiary',
    'bg-slate-800/50': 'bg-background-glass',
    'bg-slate-800/60': 'bg-background-card',

    // Text classes
    'text-white': 'text-text-primary',
    'text-slate-300': 'text-text-secondary',
    'text-slate-400': 'text-text-tertiary',
    'text-slate-200': 'text-text-primary',

    // Border classes
    'border-slate-600': 'border-border-primary',
    'border-slate-700': 'border-border-secondary',
    'border-slate-500': 'border-border-secondary',

    // Gradient classes
    'from-[#80A1BA] to-[#91C4C3]': 'bg-gradient-primary',
    'from-[#91C4C3] to-[#B4DEBD]': 'bg-gradient-secondary',
    'from-[#B4DEBD] to-[#F7B2AD]': 'bg-gradient-accent',
};

// Function to find and replace colors in a file
function migrateFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changes = 0;

        // Replace hardcoded hex colors
        Object.entries(colorMappings).forEach(([hexColor, themeClass]) => {
            const regex = new RegExp(hexColor.replace('#', '\\#'), 'g');
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, `colors.${themeClass.split('-').join('.')}`);
                changes += matches.length;
                console.log(`  ✓ Replaced ${matches.length} instances of ${hexColor} with colors.${themeClass.split('-').join('.')}`);
            }
        });

        // Replace Tailwind classes
        Object.entries(tailwindMappings).forEach(([oldClass, newClass]) => {
            const regex = new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = content.match(regex);
            if (matches) {
                content = content.replace(regex, newClass);
                changes += matches.length;
                console.log(`  ✓ Replaced ${matches.length} instances of ${oldClass} with ${newClass}`);
            }
        });

        if (changes > 0) {
            fs.writeFileSync(filePath, content);
            console.log(`  📝 Updated ${filePath} with ${changes} changes`);
        } else {
            console.log(`  ⏭️  No changes needed for ${filePath}`);
        }

        return changes;
    } catch (error) {
        console.error(`  ❌ Error processing ${filePath}:`, error.message);
        return 0;
    }
}

// Function to scan directory for files
function scanDirectory(dir, extensions = ['.tsx', '.ts', '.jsx', '.js']) {
    const files = [];

    function scan(currentDir) {
        const items = fs.readdirSync(currentDir);

        items.forEach(item => {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
                scan(fullPath);
            } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
                files.push(fullPath);
            }
        });
    }

    scan(dir);
    return files;
}

// Main migration function
function migrateColors() {
    console.log('🎨 Starting Color Migration...\n');

    const componentsDir = path.join(__dirname, '../components');
    const appDir = path.join(__dirname, '../app');

    const files = [
        ...scanDirectory(componentsDir),
        ...scanDirectory(appDir),
    ];

    console.log(`📁 Found ${files.length} files to process\n`);

    let totalChanges = 0;
    let processedFiles = 0;

    files.forEach(file => {
        console.log(`🔍 Processing ${path.relative(process.cwd(), file)}...`);
        const changes = migrateFile(file);
        totalChanges += changes;
        if (changes > 0) processedFiles++;
        console.log('');
    });

    console.log('📊 Migration Summary:');
    console.log(`  📁 Files processed: ${files.length}`);
    console.log(`  ✏️  Files modified: ${processedFiles}`);
    console.log(`  🔄 Total changes: ${totalChanges}`);

    if (totalChanges > 0) {
        console.log('\n✅ Migration completed! Please review the changes and test your application.');
        console.log('\n📝 Next steps:');
        console.log('  1. Review the changes in your components');
        console.log('  2. Test the application to ensure colors work correctly');
        console.log('  3. Update any remaining hardcoded colors manually');
        console.log('  4. Consider using the theme switcher to test different themes');
    } else {
        console.log('\n✨ No hardcoded colors found! Your project is already using the centralized color system.');
    }
}

// Run migration if called directly
if (require.main === module) {
    migrateColors();
}

module.exports = { migrateColors, colorMappings, tailwindMappings };
