import * as XLSX from 'xlsx';
import { formatDate } from './date';

export const exportMeasurementsToExcel = (memberName: string, measurements: any[]): void => {
  const data = measurements.map((m) => ({
    日期: m.date,
    '体重(kg)': m.weight,
    '体脂率(%)': m.bodyFat,
    '胸围(cm)': m.chest,
    '腰围(cm)': m.waist,
    '臀围(cm)': m.hips,
    '心率(bpm)': m.heartRate,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '体测数据');

  const fileName = `${memberName}_体测数据_${formatDate(new Date())}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
