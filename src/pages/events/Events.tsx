import React, { useState, useEffect } from 'react';
import './Events.css';
import ServerConnector from '../../services/ServerConnector';
import { Card } from 'react-bootstrap';


interface EventsProps {
    data?: any;
}

interface EventItem {
    _id: string;
    title: string;
    content: string;
    image: string;
    dateString: string;
    endDateString: string;
}

const Events: React.FC<EventsProps> = ({ data }) => {
    const [activeEvents, setNewEvents] = useState<EventItem[]>([]);
    const [oldEvents, setOldEvents] = useState<EventItem[]>([]);

    useEffect(() => {
        getData();
    }, []);

    const validateItemAsEvent = (item: any): item is EventItem => {
        return (
            typeof item.title === 'string' &&
            typeof item.content === 'string' &&
            typeof item.image === 'string' &&
            typeof item.dateString === 'string' &&
            typeof item.endDateString === 'string'
        );
    }

    const formatDataToEventItem = (data: any): EventItem => {
        return {
            _id: data._id,
            title: data.attributes.title,
            content: data.attributes.content,
            image: data.attributes.image,
            dateString: data.attributes.dateString,
            endDateString: data.attributes.endDateString
        };
    }

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
                var eventList: EventItem[] = [];
                for (let i = 0; i < response.projectData.length; i++) {
                    if (validateItemAsEvent(response.projectData[i].attributes)) {
                        eventList.push(formatDataToEventItem(response.projectData[i]));
                    }
                }
                console.log(eventList);
                setNewEvents(eventList);
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
                var eventList: EventItem[] = [];
                for (let i = 0; i < response.projectData.length; i++) {
                    if (validateItemAsEvent(response.projectData[i].attributes)) {
                        eventList.push(formatDataToEventItem(response.projectData[i]));
                    }
                }
                setOldEvents(eventList);
            }
        }, (error: any) => {
            console.log(error);
        });




    }
    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="text-center mb-12 text-white">
                <h1 className="text-4xl font-bold mb-4">Tech & Trends Blog</h1>
                <p className="text-gray-600">Exploring the latest in technology and innovation</p>
            </header>

            <main className="space-y-8 p-4">
                {[...activeEvents, ...oldEvents].map(blog => (
                    <Card key={blog._id} className="overflow-hidden bg-dark text-white p-4">
                        {/* < img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-64 object-cover"
                        /> */}
                        <div className="p-6">
                            <div className="mb-4">
                                <h2 className="text-2xl font-bold mb-2">{blog.title}</h2>
                                <div className="text-sm text-gray-600">
                                    From {blog.dateString} untill {blog.endDateString}
                                </div>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{blog.content}</p>
                            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                Read More
                            </button>
                        </div>
                    </Card>
                ))}
            </main>
        </div >
    );
};

export default Events;