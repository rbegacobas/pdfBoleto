import { Injectable } from '@nestjs/common';
import { PdfRequestDto } from './dto/pdf-request.dto';
import { TemplateService } from '../templates/template.service';
import { PdfGeneratorUtil } from '../utils/pdf-generator.util';



@Injectable()
export class PdfService {
  constructor(
    private readonly templateService: TemplateService,
    private readonly pdfGeneratorUtil: PdfGeneratorUtil,
  ) {}

   /**
   * Generates a PDF based on the provided request data.
   * @param pdfRequestDto The DTO containing the request data.
   * @returns A Promise resolving to a Buffer containing the generated PDF.
   */
   async generatePdf(pdfRequestDto: PdfRequestDto): Promise<Buffer> {
    const template = this.templateService.getTemplate(pdfRequestDto.country);
    const templateVariables = this.createTemplateVariables(pdfRequestDto);
    const html = this.templateService.fillTemplate(template, templateVariables);
    return await this.pdfGeneratorUtil.generatePdf(html);
  }

 /**
   * Creates an object with all the template variables based on the request data.
   * @param pdfRequestDto The DTO containing the request data.
   * @returns An object with all the template variables.
   */
 private createTemplateVariables(pdfRequestDto: PdfRequestDto): TemplateVariables {
  const entryDate = new Date(pdfRequestDto.entryDate);
  const exitDate = new Date(pdfRequestDto.exitDate);
  console.log('Valor de entrada:', entryDate);
  console.log('Valor de entrada2:', this.formatDate(entryDate));

  return {
    name: pdfRequestDto.name,
      Entrada: this.formatDate(entryDate),
      Penalty: this.calculatePenalty(entryDate),
      randomNumber: this.generateRandomNumber(),
      dayEntrada: entryDate.getDate().toString(),
      monthEntrada: this.getMonthName(entryDate),
      weekdayEntrada: this.getWeekdayName(entryDate),
      daySalida: exitDate.getDate().toString(),
      monthSalida: this.getMonthName(exitDate),
      weekdaySalida: this.getWeekdayName(exitDate),
      noches: this.calculateNights(entryDate, exitDate).toString(),
  };
}

/**
   * Formats a date to YYYY-MM-DD string.
   * @param date The date to format.
   * @returns A string representation of the date in YYYY-MM-DD format.
   */
private formatDate(date: Date): string {
  console.log('Valor de la fecha:', date.toLocaleDateString('en-EN', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).replace(/\//g, '-'));
  // Ajuste: Usar toLocaleDateString para formatear la fecha correctamente
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  }).replace(/\//g, '-');
}

/**
 * Calculates the penalty date (one day before entry date).
 * @param entryDate The entry date.
 * @returns A string representation of the penalty date in YYYY-MM-DD format.
 */
private calculatePenalty(entryDate: Date): string {
  const penaltyDate = new Date(entryDate);
  penaltyDate.setDate(penaltyDate.getDate() - 1);
  return this.formatDate(penaltyDate);
}

/**
 * Generates a random 4-digit number.
 * @returns A string representation of a random 4-digit number.
 */
private generateRandomNumber(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Gets the full name of the month for a given date.
 * @param date The date to get the month name from.
 * @returns The full name of the month in Spanish.
 */
private getMonthName(date: Date): string {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[date.getMonth()];
}

/**
 * Gets the name of the weekday for a given date.
 * @param date The date to get the weekday name from.
 * @returns The name of the weekday in Spanish.
 */
private getWeekdayName(date: Date): string {
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return weekdays[date.getDay()];
}

/**
 * Calculates the number of nights between two dates.
 * @param entryDate The entry date.
 * @param exitDate The exit date.
 * @returns The number of nights between the two dates.
 */
private calculateNights(entryDate: Date, exitDate: Date): number {
  const diffTime = Math.abs(exitDate.getTime() - entryDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
}

interface TemplateVariables {
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
}