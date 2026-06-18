import * as XLSX from 'xlsx';
import { formatDate } from './date';
import type { Measurement } from '../types';

export const exportMeasurementsToExcel = (memberName: string, measurements: Measurement[]): void => {
  const data = measurements.map((m) => ({
    日期: m.date,
    '体重(kg)': m.weight,
    '体脂率(%)': m.bodyFatRate,
    '胸围(cm)': m.chest,
    '腰围(cm)': m.waist,
    '臀围(cm)': m.hip,
    '心率(bpm)': m.heartRate,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '体测数据');

  const fileName = `${memberName}_体测数据_${formatDate(new Date())}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

export const exportAllMembersMeasurementsToExcel = (members: { id: string; name: string }[], allMeasurements: Measurement[]): void => {
  const wb = XLSX.utils.book_new();

  members.forEach((member) => {
    const memberMeasurements = allMeasurements
      .filter((m) => m.memberId === member.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (memberMeasurements.length > 0) {
      const data = memberMeasurements.map((m) => ({
        日期: m.date,
        '体重(kg)': m.weight,
        '体脂率(%)': m.bodyFatRate,
        '胸围(cm)': m.chest,
        '腰围(cm)': m.waist,
        '臀围(cm)': m.hip,
        '心率(bpm)': m.heartRate,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, member.name);
    }
  });

  const fileName = `全部会员体测数据_${formatDate(new Date())}.xlsx`;
  XLSX.writeFile(wb, fileName);
};
