#!/usr/bin/env node

/**
 * Build script for DRY2 Web Components
 * 
 * This script handles:
 * - Component bundling and optimization
 * - Documentation generation
 * - Asset processing
 * - Distribution preparation
 */

import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync, rmSync } from 'fs';
import { join, dirname, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { gzipSync } from 'zlib';
import { minify } from 'terser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const srcDir = join(rootDir, 'src');
const distDir = join(rootDir, 'dist');
const docsDir = join(rootDir, 'docs');

class Builder {
  constructor() {
    this.components = [];
    this.startTime = Date.now();
  }

  /**
   * Main build process
   */
  async build() {
    console.log('🔨 Building DRY2 Web Components...\n');

    try {
      // Clean and create dist directory
      this.cleanDist();
      this.createDist();

      // Discover components
      this.discoverComponents();

      // Build steps
      await this.generateBundledFile();
      await this.generateMinifiedFile();
      await this.generateGzippedFile();
      await this.generateIndex();
      await this.copyAssets();
      await this.generatePackageInfo();
      await this.generateTypeDefinitions();

      const duration = Date.now() - this.startTime;
      console.log(`\n✅ Build completed successfully in ${duration}ms`);
      console.log(`📦 Distribution files created in ${distDir}`);

    } catch (error) {
      console.error('❌ Build failed:', error.message);
      console.error(error.stack);
      process.exit(1);
    }
  }

  /**
   * Clean dist directory
   */
  cleanDist() {
    if (existsSync(distDir)) {
      console.log('🧹 Cleaning dist directory...');
      this.removeDirectory(distDir);
    }
  }

  /**
   * Create dist directory structure
   */
  createDist() {
    console.log('📁 Creating dist directory structure...');
    mkdirSync(distDir, { recursive: true });
    mkdirSync(join(distDir, 'types'), { recursive: true });
  }

  /**
   * Discover all components in src directory
   */
  discoverComponents() {
    console.log('🔍 Discovering components...');
    
    const dry2Dir = join(srcDir, 'dry2');
    const files = readdirSync(dry2Dir);
    
    // Define component dependencies
    const dependencies = {
      'component-builder': ['alpine-utils'],
      'component-builder-example': ['component-builder']
    };
    
    // First, find and add the base class
    const baseFile = files.find(file => file === 'base.js');
    if (baseFile) {
      this.components.push({
        name: 'base',
        filename: baseFile,
        path: join(dry2Dir, baseFile)
      });
      console.log('   Bundling base...');
    }
    
    // Create a map of all components
    const componentMap = new Map(
      files
        .filter(file => file.endsWith('.js') && 
                        file !== 'dry2.js' && 
                        file !== 'base.js')
        .map(file => [
          file.replace('.js', ''),
          {
            name: this.toCamelCase(file.replace('.js', '')),
            filename: file,
            path: join(dry2Dir, file)
          }
        ])
    );

    // Function to add component and its dependencies
    const addComponent = (componentName) => {
      if (!componentMap.has(componentName)) return;
      
      const component = componentMap.get(componentName);
      if (this.components.some(c => c.name === component.name)) return;

      // Add dependencies first
      if (dependencies[componentName]) {
        dependencies[componentName].forEach(dep => addComponent(dep));
      }

      this.components.push(component);
      componentMap.delete(componentName);
    };

    // Add components in dependency order
    Object.keys(dependencies).forEach(addComponent);

    // Add remaining components
    componentMap.forEach(component => {
      this.components.push(component);
    });

    console.log(`   Found ${this.components.length} components`);
  }

  /**
   * Convert hyphenated string to camelCase
   */
  toCamelCase(str) {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Generate bundled file with all components
   */
  async generateBundledFile() {
    console.log('📦 Generating bundled file...');
    
    // Read base component first
    const baseComponent = this.components.find(c => c.name === 'base');
    const baseContent = baseComponent ? readFileSync(baseComponent.path, 'utf8') : '';
    
    // Read all other component files
    const componentContents = this.components
      .filter(component => component.name !== 'base')
      .map(component => {
        console.log(`   Bundling ${component.name}...`);
        return readFileSync(component.path, 'utf8');
      });
    
    // Create bundled content
    const bundledContent = `/**
 * DRY2 Web Components Library - Complete Bundle
 * 
 * This file contains all DRY2 components in a single bundle.
 * Simply include this file to get access to all components.
 * 
 * Components included: ${this.components.map(c => c.name).join(', ')}
 * 
 * @version ${this.getVersion()}
 * @license MIT
 * @see https://github.com/yourusername/dry2-web-components
 */

// Base Component
${baseContent}

// All Components
${componentContents.join('\n\n')}

// Library Info
window.DRY2 = {
  version: '${this.getVersion()}',
  components: [${this.components.map(c => `'${c.name}'`).join(', ')}],
  loadedAt: new Date().toISOString()
};

// Make BaseElement available globally
window.BaseElement = BaseElement;

console.log('🎉 DRY2 Web Components v${this.getVersion()} loaded with', window.DRY2.components.length, 'components');
`;

    writeFileSync(join(distDir, 'dry2.js'), bundledContent);
    console.log(`   Created bundled file with ${this.components.length + 1} components`);
  }

  /**
   * Generate minified bundle
   */
  async generateMinifiedFile() {
    console.log('🗜️  Generating minified file...');
    
    const sourceContent = readFileSync(join(distDir, 'dry2.js'), 'utf8');
    
    try {
      const result = await minify(sourceContent, {
        compress: {
          drop_console: false, // Keep console.log for library info
          drop_debugger: true,
          dead_code: true,
          unused: true
        },
        mangle: {
          reserved: [
            'DRY2', 
            'BaseElement',
            // Alpine.js method names used in templates
            'getButtonClasses',
            'getAvatarClasses',
            'getInitialsBackground', 
            'getImageClasses',
            'shouldShowImage',
            'shouldShowInitials',
            'shouldShowIcon',
            'handleImageLoad',
            'handleImageError',
            'getCardClasses',
            'getHeaderClasses',
            'getMediaClasses', 
            'getBodyClasses',
            'getFooterClasses',
            'hasHeader',
            'hasMedia',
            'hasBody',
            'hasFooter',
            'handleCardClick',
            'getComponentClasses',
            'handleClick',
            'handleKeydown'
          ]
        },
        output: {
          comments: /^!|@preserve|@license|@cc_on/i, // Keep license comments
          preamble: `/*! DRY2 Web Components v${this.getVersion()} | MIT License */`
        }
      });

      writeFileSync(join(distDir, 'dry2.min.js'), result.code);
      
      const originalSize = (sourceContent.length / 1024).toFixed(1);
      const minifiedSize = (result.code.length / 1024).toFixed(1);
      const savings = (((sourceContent.length - result.code.length) / sourceContent.length) * 100).toFixed(1);
      
      console.log(`   Created minified file: ${originalSize}KB → ${minifiedSize}KB (${savings}% smaller)`);
    } catch (error) {
      console.error('❌ Minification failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate gzipped version of minified file
   */
  async generateGzippedFile() {
    console.log('📦 Generating gzipped file...');
    
    const minifiedContent = readFileSync(join(distDir, 'dry2.min.js'));
    
    try {
      const gzippedContent = gzipSync(minifiedContent, {
        level: 9, // Maximum compression
        memLevel: 9
      });

      writeFileSync(join(distDir, 'dry2.min.js.gz'), gzippedContent);
      
      const minifiedSize = (minifiedContent.length / 1024).toFixed(1);
      const gzippedSize = (gzippedContent.length / 1024).toFixed(1);
      const savings = (((minifiedContent.length - gzippedContent.length) / minifiedContent.length) * 100).toFixed(1);
      
      console.log(`   Created gzipped file: ${minifiedSize}KB → ${gzippedSize}KB (${savings}% smaller)`);
    } catch (error) {
      console.error('❌ Gzip compression failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate main index file
   */
  async generateIndex() {
    console.log('📝 Generating index file...');
    
    const indexContent = `/**
 * DRY2 Web Components Library
 * 
 * A comprehensive, accessible web components library built with modern web standards.
 * 
 * @version ${this.getVersion()}
 * @license MIT
 * @see https://github.com/yourusername/dry2-web-components
 */

// Base component class
export { BaseElement } from './dry2.js';

// All components are included in the main bundle
// Simply import the main bundle to get all components

export function loadAllComponents() {
  return Promise.resolve([import('./dry2.js')]);
}

export function loadComponent(name) {
  // All components are included in the main bundle
  return Promise.resolve(import('./dry2.js'));
}

export const components = [
${this.components.map(component => 
  `  '${component.name}'`
).join(',\n')}
];

export const version = '${this.getVersion()}';
`;

    writeFileSync(join(distDir, 'index.js'), indexContent);
  }

  /**
   * Copy additional assets
   */
  async copyAssets() {
    console.log('📦 Copying assets...');
    
    // Copy package.json
    copyFileSync(
      join(rootDir, 'package.json'),
      join(distDir, 'package.json')
    );

    // Copy README
    copyFileSync(
      join(rootDir, 'README.md'),
      join(distDir, 'README.md')
    );

    // Copy LICENSE if exists
    if (existsSync(join(rootDir, 'LICENSE'))) {
      copyFileSync(
        join(rootDir, 'LICENSE'),
        join(distDir, 'LICENSE')
      );
    }


  }

  /**
   * Generate package info
   */
  async generatePackageInfo() {
    console.log('📋 Generating package info...');
    
    const packageInfo = {
      name: 'dry2-web-components',
      version: this.getVersion(),
      description: 'A comprehensive, accessible web components library',
      main: 'index.js',
      module: 'index.js',
      type: 'module',
      files: [
        'index.js',
        'dry2.js',
        'dry2.min.js',
        'dry2.min.js.gz',
        'types/',
        'README.md',
        'LICENSE'
      ],
      keywords: [
        'web-components',
        'custom-elements',
        'ui-library',
        'alpine.js',
        'tailwind-css',
        'accessibility',
        'responsive-design'
      ],
      author: 'DRY2 Team',
      license: 'MIT',
      repository: {
        type: 'git',
        url: 'https://github.com/yourusername/dry2-web-components.git'
      },
      bugs: {
        url: 'https://github.com/yourusername/dry2-web-components/issues'
      },
      homepage: 'https://github.com/yourusername/dry2-web-components#readme',
      optionalDependencies: {
        'qrious': '^4.0.2',
        'dompurify': '^3.0.5'
      }
    };

    writeFileSync(
      join(distDir, 'package.json'),
      JSON.stringify(packageInfo, null, 2)
    );
  }

  /**
   * Generate TypeScript definitions
   */
  async generateTypeDefinitions() {
    console.log('📝 Generating TypeScript definitions...');
    
    // Main index.d.ts
    const indexTypes = `/**
 * DRY2 Web Components Library - TypeScript Definitions
 */

export declare class BaseElement extends HTMLElement {
  state: Record<string, any>;
  setState(newState: Record<string, any>): void;
  renderSlot(slotName?: string, fallback?: string): string;
  getBooleanAttribute(name: string, defaultValue?: boolean): boolean;
  getNumericAttribute(name: string, defaultValue?: number): number;
  emit(eventName: string, detail?: any): boolean;
  escapeHtml(unsafe: string): string;
  $(selector: string): Element | null;
  $$(selector: string): Element[];
  render(): string;
  forceRender(): void;
}

export declare function loadAllComponents(): Promise<any[]>;
export declare function loadComponent(name: string): Promise<any>;
export declare const components: string[];
export declare const version: string;

// Component type definitions
${this.components.map(component => this.generateComponentTypes(component)).join('\n\n')}

// Global declarations
declare global {
  namespace JSX {
    interface IntrinsicElements {
${this.components.map(component => 
  `      '${this.getComponentTagName(component)}': any;`
).join('\n')}
    }
  }
}
`;

    writeFileSync(join(distDir, 'index.d.ts'), indexTypes);

    // Individual component type files
    this.components.forEach(component => {
      const componentTypes = this.generateComponentTypes(component);
      writeFileSync(
        join(distDir, 'types', `${component.name}.d.ts`),
        componentTypes
      );
    });
  }

  /**
   * Generate TypeScript definitions for a component
   */
  generateComponentTypes(component) {
    return `export declare class ${this.toPascalCase(component.name)} extends BaseElement {
  // Add specific properties and methods based on component analysis
  connectedCallback(): void;
  disconnectedCallback(): void;
  attributeChangedCallback(name: string, oldValue: string, newValue: string): void;
  
  // Common component properties
  disabled?: boolean;
  variant?: string;
  size?: string;
}`;
  }

  /**
   * Get component tag name
   */
  getComponentTagName(component) {
    // This should be extracted from the component file
    // For now, return a default pattern
    return component.name.includes('dry-') ? component.name : `${component.name}-component`;
  }

  /**
   * Convert kebab-case to PascalCase
   */
  toPascalCase(str) {
    return str
      .replace(/-([a-z])/g, (match, letter) => letter.toUpperCase())
      .replace(/^[a-z]/, match => match.toUpperCase());
  }

  /**
   * Get version from package.json
   */
  getVersion() {
    try {
      const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
      return packageJson.version || '1.0.0';
    } catch {
      return '1.0.0';
    }
  }

  /**
   * Copy directory recursively
   */
  copyDirectory(src, dest) {
    mkdirSync(dest, { recursive: true });
    
    const files = readdirSync(src);
    files.forEach(file => {
      const srcPath = join(src, file);
      const destPath = join(dest, file);
      
      if (statSync(srcPath).isDirectory()) {
        this.copyDirectory(srcPath, destPath);
      } else {
        copyFileSync(srcPath, destPath);
      }
    });
  }

  /**
   * Remove directory recursively
   */
  removeDirectory(dir) {
    if (existsSync(dir)) {
      rmSync(dir, { recursive: true, force: true });
    }
  }
}

// Run build if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const builder = new Builder();
  builder.build().catch(console.error);
}

export default Builder;
