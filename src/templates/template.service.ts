import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

type TemplateVariables = {
  name: string;
  Entrada: string;
  Penalty: string;
  randomNumber: string;
  dayEntrada: string;
  monthEntrada: string;
  weekdayEntrada: string;
  daySalida: string;
  monthSalida: string;
  weekdaySalida: string;
  noches: string;
};

@Injectable()
export class TemplateService implements OnModuleInit {
  private readonly logger = new Logger(TemplateService.name);
  private templates: Record<string, string> = {};

  async onModuleInit() {
    await this.loadTemplates();
  }

  private async loadTemplates() {
    let templateDir: string;
    if (process.env.NODE_ENV === 'production') {
      templateDir = path.join(process.cwd(), 'dist', 'templates');
    } else {
      templateDir = path.join(process.cwd(), 'src', 'templates');
    }
    
    this.logger.log(`Loading templates from: ${templateDir}`);
    const templateFiles = ['GEO.html', 'MGA.html', 'PBM.html'];

    for (const file of templateFiles) {
      try {
        const filePath = path.join(templateDir, file);
        this.logger.log(`Attempting to load template: ${filePath}`);
        const content = await fs.readFile(filePath, 'utf-8');
        this.templates[file.split('.')[0]] = content;
        this.logger.log(`Successfully loaded template: ${file}`);
      } catch (error) {
        this.logger.error(`Failed to load template ${file}`, error.stack);
      }
    }

    this.logger.log(`Loaded templates: ${Object.keys(this.templates).join(', ')}`);
  }

  getTemplate(country: string): string {
    const template = this.templates[country];
    if (!template) {
      throw new Error(`Template not found for country: ${country}`);
    }
    return template;
  }

  fillTemplate(template: string, variables: TemplateVariables): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
      const value = variables[key] || '';
      // Si es el campo 'name', convertir saltos de línea en <br>
      if (key === 'name') {
        return value.replace(/\n/g, '<br>');
      }
      return value;
    });
  }
}