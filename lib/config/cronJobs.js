const cron = require('node-cron');
const eventModel = require('../model/eventModel');

const scheduleEventDeactivation = () => {
    cron.schedule('0 0 * * *', () => { // 00시 업데이트 // 테스트시 '* * * * * *' 사용
        console.log('만료된 이벤트 찾는중');
        const now = new Date();

        eventModel.getAllActiveEvents((error, events) => {
            if (error) {
                console.error('Fetching Error :', error);
                return;
            }

            events.forEach(event => {
                const endDate = new Date(event.E_END_DATE);
                if (endDate < now) {
                    eventModel.updateEventStatus(event.E_NO, 3, (error) => {
                        if (error) {
                            console.error(`비활성화 실패 : ${event.E_NO}:`, error);
                        } else {
                            console.log(`Event ${event.E_NO} 비활성화 성공`);
                        }
                    });
                }
            });
        });
    });
};

module.exports = { scheduleEventDeactivation };
