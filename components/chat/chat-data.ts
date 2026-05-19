export type Conversation = {
  id: string;
  preview: string;
  time: string;
  initials: string;
  active: boolean;
};

export type ChatMessage = {
  id: string;
  type:
    | "date"
    | "system"
    | "outgoing-file"
    | "outgoing-audio"
    | "outgoing"
    | "incoming";
  text: string;
  time: string;
  audioUrl?: string;
  duration?: number;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  pageCount?: number;
};

export const conversations: Conversation[] = [
  {
    id: "51923449088",
    preview: "Imagen",
    time: "19:11",
    initials: "CL",
    active: false,
  },
  {
    id: "51969226599",
    preview: "Hola vecino(a) *Yovana* - *Pago pendiente* - *Tus productos:* 1x ESCOBILLA",
    time: "17:26",
    initials: "CL",
    active: false,
  },
  {
    id: "51922106555",
    preview: "Buenos dias, Senora Vanesa:* Total de clientes con deuda:* 3 1. *Elizabeth*",
    time: "07:00",
    initials: "CL",
    active: false,
  },
  {
    id: "51935941511",
    preview: "Hola vecino(a) *Elizabeth* - *Pago pendiente* - *Tus productos:* 1x SALCHIPAPA",
    time: "Ayer",
    initials: "CL",
    active: false,
  },
  {
    id: "51981006538",
    preview: "",
    time: "martes",
    initials: "CL",
    active: false,
  },
  {
    id: "932889985",
    preview: "hola",
    time: "07/05",
    initials: "CL",
    active: true,
  },
];

export const initialTimeline: ChatMessage[] = [
  {
    id: "date-1",
    type: "date",
    text: "Ayer",
    time: "",
  },
  {
    id: "system-1",
    type: "system",
    text: "Crhis Leonel ha resuelto la conversacion",
    time: "12:33",
  },
  {
    id: "system-2",
    type: "system",
    text: "Cristofer Leonardo ha reabierto la conversacion",
    time: "12:34",
  },
  {
    id: "system-3",
    type: "system",
    text: "Cristofer Leonardo ha resuelto la conversacion",
    time: "12:34",
  },
  {
    id: "system-4",
    type: "system",
    text: "Cristofer Leonardo ha reabierto la conversacion",
    time: "12:35",
  },
  {
    id: "date-2",
    type: "date",
    text: "Hoy",
    time: "",
  },
  {
    id: "file-1",
    type: "outgoing-file",
    text: "CATALOGO.PDF",
    time: "14:17",
  },
  {
    id: "out-1",
    type: "outgoing",
    text: "HOLA",
    time: "15:48",
  },
  {
    id: "out-2",
    type: "outgoing",
    text: "hola",
    time: "15:48",
  },
  {
    id: "out-3",
    type: "outgoing",
    text: "hola",
    time: "15:48",
  },
  {
    id: "in-1",
    type: "incoming",
    text: "hola",
    time: "15:50",
  },
];
