export type MailProps = {
    sender?: string,
    recipient: string,
    data?: ReportData
}

export type ReportData = {
    orderTotal: number,
    subTotal: number,
    subTotalWithDisount: number,
    total: number
}