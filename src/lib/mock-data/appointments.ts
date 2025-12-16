export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  duration: number; // minutes
  treatment: string;
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  room?: string;
}

// Get dates relative to today
const today = new Date();
const formatDate = (daysOffset: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const mockAppointments: Appointment[] = [
  // Today's appointments
  {
    id: 'A001',
    patientId: 'P001',
    patientName: '김서연',
    date: formatDate(0),
    time: '09:00',
    duration: 60,
    treatment: 'Pico Toning',
    status: 'completed',
    room: '시술실 1',
    notes: '8회차 시술',
  },
  {
    id: 'A002',
    patientId: 'P003',
    patientName: '박민지',
    date: formatDate(0),
    time: '10:30',
    duration: 45,
    treatment: 'Genesis',
    status: 'in-progress',
    room: '시술실 2',
  },
  {
    id: 'A003',
    patientId: 'P002',
    patientName: '이준호',
    date: formatDate(0),
    time: '11:30',
    duration: 30,
    treatment: '상담',
    status: 'confirmed',
    room: '상담실',
  },
  {
    id: 'A004',
    patientId: 'P005',
    patientName: '최지영',
    date: formatDate(0),
    time: '14:00',
    duration: 90,
    treatment: 'Ultherapy',
    status: 'scheduled',
    room: '시술실 1',
    notes: '첫 시술 - 마취 크림 30분 전 도포',
  },
  {
    id: 'A005',
    patientId: 'P008',
    patientName: '정하늘',
    date: formatDate(0),
    time: '15:30',
    duration: 45,
    treatment: 'Rejuran Healer',
    status: 'scheduled',
    room: '시술실 2',
  },
  {
    id: 'A006',
    patientId: 'P010',
    patientName: '신예진',
    date: formatDate(0),
    time: '16:30',
    duration: 30,
    treatment: 'Skin Botox',
    status: 'scheduled',
    room: '시술실 1',
  },

  // Tomorrow
  {
    id: 'A007',
    patientId: 'P004',
    patientName: '최수현',
    date: formatDate(1),
    time: '09:30',
    duration: 60,
    treatment: 'Pico Toning',
    status: 'confirmed',
    room: '시술실 1',
  },
  {
    id: 'A008',
    patientId: 'P006',
    patientName: '강민수',
    date: formatDate(1),
    time: '11:00',
    duration: 45,
    treatment: 'Fractional CO2',
    status: 'confirmed',
    room: '시술실 2',
  },
  {
    id: 'A009',
    patientId: 'P007',
    patientName: '윤서아',
    date: formatDate(1),
    time: '14:00',
    duration: 60,
    treatment: 'Profhilo',
    status: 'scheduled',
    room: '시술실 1',
  },
  {
    id: 'A010',
    patientId: 'P009',
    patientName: '임도현',
    date: formatDate(1),
    time: '15:30',
    duration: 30,
    treatment: '상담',
    status: 'scheduled',
    room: '상담실',
  },

  // Day after tomorrow
  {
    id: 'A011',
    patientId: 'P011',
    patientName: '한소희',
    date: formatDate(2),
    time: '10:00',
    duration: 90,
    treatment: 'Ultherapy',
    status: 'confirmed',
    room: '시술실 1',
  },
  {
    id: 'A012',
    patientId: 'P012',
    patientName: '오재민',
    date: formatDate(2),
    time: '13:00',
    duration: 45,
    treatment: 'Genesis',
    status: 'scheduled',
    room: '시술실 2',
  },

  // Past appointments (yesterday)
  {
    id: 'A013',
    patientId: 'P013',
    patientName: '배수지',
    date: formatDate(-1),
    time: '10:00',
    duration: 60,
    treatment: 'Pico Toning',
    status: 'completed',
    room: '시술실 1',
  },
  {
    id: 'A014',
    patientId: 'P014',
    patientName: '조현우',
    date: formatDate(-1),
    time: '14:00',
    duration: 30,
    treatment: '상담',
    status: 'no-show',
    room: '상담실',
  },

  // Next week
  {
    id: 'A015',
    patientId: 'P001',
    patientName: '김서연',
    date: formatDate(7),
    time: '10:00',
    duration: 60,
    treatment: 'Pico Toning',
    status: 'scheduled',
    room: '시술실 1',
    notes: '9회차 시술 예정',
  },
  {
    id: 'A016',
    patientId: 'P015',
    patientName: '김태희',
    date: formatDate(5),
    time: '11:00',
    duration: 45,
    treatment: 'Rejuran Healer',
    status: 'confirmed',
    room: '시술실 2',
  },
];

export const getAppointmentsByDate = (date: string): Appointment[] => {
  return mockAppointments.filter(apt => apt.date === date);
};

export const getTodayAppointments = (): Appointment[] => {
  return getAppointmentsByDate(formatDate(0));
};

export const getUpcomingAppointments = (days: number = 7): Appointment[] => {
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);

  return mockAppointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= today && aptDate <= endDate && apt.status !== 'completed' && apt.status !== 'cancelled' && apt.status !== 'no-show';
  });
};
