import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

type Locale = 'tr' | 'en' | 'ar' | 'he';

const LOCALES: Locale[] = ['tr', 'en', 'ar', 'he'];

function getNestedValue(obj: Record<string, unknown>, dottedPath: string): unknown {
    return dottedPath.split('.').reduce<unknown>((acc, key) => {
        if (!acc || typeof acc !== 'object') return undefined;
        return (acc as Record<string, unknown>)[key];
    }, obj);
}

function main(): void {
    const cwd = process.cwd();
    const templatesDir = path.join(cwd, 'templates');
    const localesDir = path.join(cwd, 'locales');
    const controllerPath = path.join(cwd, 'apps/api/src/controllers/email.controller.ts');

    const localeData = Object.fromEntries(
        LOCALES.map((locale) => [
            locale,
            JSON.parse(fs.readFileSync(path.join(localesDir, `${locale}.json`), 'utf-8')) as Record<string, unknown>,
        ])
    ) as Record<Locale, Record<string, unknown>>;

    const templateFiles = fs.readdirSync(templatesDir).filter((file) => file.endsWith('.hbs'));
    const missingTranslations: string[] = [];
    const compileErrors: string[] = [];

    for (const file of templateFiles) {
        const fullPath = path.join(templatesDir, file);
        const content = fs.readFileSync(fullPath, 'utf-8');

        try {
            Handlebars.compile(content);
        } catch (error) {
            compileErrors.push(`${file}: ${(error as Error).message}`);
        }

        const translationKeys = [...content.matchAll(/{{\s*t\s+"([^"]+)"/g)].map((match) => match[1]);
        for (const key of translationKeys) {
            for (const locale of LOCALES) {
                const value = getNestedValue(localeData[locale], key);
                if (typeof value !== 'string') {
                    missingTranslations.push(`${locale}:${key} (${file})`);
                }
            }
        }
    }

    const controllerContent = fs.readFileSync(controllerPath, 'utf-8');
    const controllerTemplateKeys = [
        ...controllerContent.matchAll(/this\.sendEmail\([^)]*?'([^']+)'\)/g),
    ].map((match) => match[1]);

    const missingTemplateFiles: string[] = [];
    for (const templateKey of controllerTemplateKeys) {
        const directTemplatePath = path.join(templatesDir, `${templateKey}.hbs`);
        if (!fs.existsSync(directTemplatePath)) {
            missingTemplateFiles.push(templateKey);
        }
    }

    if (compileErrors.length || missingTranslations.length || missingTemplateFiles.length) {
        console.error('Template validation failed.');
        if (compileErrors.length) {
            console.error('\nCompile errors:');
            for (const error of compileErrors) {
                console.error(`- ${error}`);
            }
        }
        if (missingTranslations.length) {
            console.error('\nMissing translations:');
            for (const missing of missingTranslations) {
                console.error(`- ${missing}`);
            }
        }
        if (missingTemplateFiles.length) {
            console.error('\nMissing templates referenced by controller:');
            for (const template of missingTemplateFiles) {
                console.error(`- ${template}`);
            }
        }
        process.exit(1);
    }

    console.log(`Templates checked: ${templateFiles.length}`);
    console.log(`Locales checked: ${LOCALES.length}`);
    console.log('Template validation passed.');
}

main();
