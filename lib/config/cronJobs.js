const cron = require('node-cron');
const eventModel = require('../model/eventModel');

const scheduleEventDeactivation = () => {
    cron.schedule('0 0 * * *', () => { // 00시 업데이트 // 테스트시 '* * * * * *' 사용
        console.log('Checking for expired events...');
        const now = new Date();

        eventModel.getAllActiveEvents((error, events) => {
            if (error) {
                console.error('Error fetching active events:', error);
                return;
            }

            events.forEach(event => {
                const endDate = new Date(event.E_END_DATE);
                if (endDate < now) {
                    eventModel.updateEventStatus(event.E_NO, 3, (error) => {
                        if (error) {
                            console.error(`Failed to deactivate event ${event.E_NO}:`, error);
                        } else {
                            console.log(`Event ${event.E_NO} has been deactivated.`);
                        }
                    });
                }
            });
        });
    });
};

module.exports = { scheduleEventDeactivation };
