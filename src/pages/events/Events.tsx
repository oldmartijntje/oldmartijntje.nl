import React, { useState, useEffect } from 'react';
import './Events.css';
import ServerConnector from '../../services/ServerConnector';


interface EventsProps {
    data?: any;
}

const Events: React.FC<EventsProps> = ({ data }) => {
    const [activeEvents, setNewEvents] = useState({});
    const [oldEvents, setOldEvents] = useState({});

    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        const serverConnector = new ServerConnector();
        console.log("Getting events");
        serverConnector.fetchData('https://api.oldmartijntje.nl/projectData/getProjectData', 'POST', JSON.stringify({
            "from": 0,
            "amount": 9999999999,
            projectId: "Event"
        }), (response: any) => {
            console.log(response);
            if (response.status === 200) {
                setNewEvents(response.projectData);
            }
        }, (error: any) => {
            console.log(error);
        });
        serverConnector.fetchData('https://api.oldmartijntje.nl/projectData/getProjectData', 'POST', JSON.stringify({
            "from": 0,
            "amount": 9999999999,
            projectId: "PastEvent"
        }), (response: any) => {
            console.log(response);
            if (response.status === 200) {
                setOldEvents(response.projectData);
            }
        }, (error: any) => {
            console.log(error);
        });




    }
    return (
        <div className="events">

        </div>
    );
};

export default Events;