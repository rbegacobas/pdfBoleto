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
    const templateDir = path.join(process.cwd(), 'src', 'templates');
    const templateFiles = ['GEO.html', 'MGA.html', 'PBM.html'];

    for (const file of templateFiles) {
      try {
        const content = await fs.readFile(path.join(templateDir, file), 'utf-8');
        this.templates[file.split('.')[0]] = content;
      } catch (error) {
        this.logger.error(`Failed to load template ${file}`, error.stack);
      }
    }
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
      return variables[key] || '';
    });
  }
}