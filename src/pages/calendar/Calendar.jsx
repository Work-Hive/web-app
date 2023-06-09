import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css'
import styles from 'react-day-picker/dist/style.module.css';
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween.js'
import { dayoffList } from "../../services/WorkiveApiClient.js"
import { leaveTypeJson, statusJson } from '../../constants/index.js'
import '../../constants/style.css'
import { Toolbar } from '../../components/index.js'
import useCalendarData from '../../utils/holidays.js';
import { PlusIcon } from '@heroicons/react/20/solid';

dayjs.extend(isBetween);

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [requestsList, setRequestsList] = useState([])
  const [offDays, setOffDays] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)
  const { calendarCurrentDate, setCalendarCurrentDate, holidaysDate } = useCalendarData();
  const selectedDateRequests = requestsList.filter(r => (dayjs(selectedDate).isBetween(dayjs(r.start), dayjs(r.end), 'days', '[]')))
  const isWorkingDay = holidaysDate.every(d => !dayjs(d).isSame(selectedDate, 'day'))

  useEffect(() => {
    dayoffList().then(data => {
      console.log('Success:', data);
      setRequestsList(data)
    }).catch(error => {
      console.error('Error:', error);
      setErrorMessage(error.error)
    })
  }, [])

  const result = [];
  useEffect(() => {
    if (requestsList.length == 0) return;

    const monthDays = calendarCurrentDate.endOf('month').format('D');
    for (let i = 1; i <= monthDays; i++) {
      const currentDate = dayjs(calendarCurrentDate).date(i);
      const isHoliday = holidaysDate.some(date => dayjs(date).isSame(currentDate, 'day'));
      if (isHoliday) continue;
      const off = requestsList.filter(r => currentDate.isBetween(dayjs(r.start), dayjs(r.end), 'days', '[]'));
      if (off.length > 0) {
        result.push(currentDate.toDate())
      }
    }
    setOffDays(result)
  }, [requestsList, calendarCurrentDate])

  const handleMonthChange = (newDate) => {
    setCalendarCurrentDate(dayjs(newDate));
  }

  const showDaysOff = (date) => {
    if (date) setSelectedDate(date)
  }

  const navigate = useNavigate();
  const sendRequest = () => {
    navigate('/dayoff/create');
  }

  const myStyles = {
    dayPicker: {
      '@media (min-width: 768px)': {
        minWidth: '768px'
      }
    },
    day: {
      padding: '20px',
      margin: "7px 12px",
      fontSize: '18px'
    },
    head: {
      fontSize: '18px'
    },
    caption: {
      margin: "7px"
    }
  }


  return (
    <div className='md:w-4/5 w-full fixed top-16 md:top-0 bottom-0 right-0 overflow-y-auto bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200'>
      <div className='pt-5 md:mx-auto md:w-full md:max-w-5xl'>
        <Toolbar title='Calendar'>
          <div className='flex justify-center'>
            <button onClick={() => sendRequest()} className="flex items-center w-full rounded-md bg-indigo-600 p-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              <PlusIcon className='h-5 w-5 mr-2 text-gray-400'></PlusIcon>
              Request Day Off
            </button>
          </div>
        </Toolbar>

        {errorMessage && <p className="mb-4 text-center text-red-500 py-2 font-semibold text-sm px-4">{errorMessage}</p>}

        <main className='px-4'>
          <div>
            <DayPicker modifiers={{ highlighted: offDays, holiday: holidaysDate }} modifiersStyles={{ highlighted: { color: '#4338ca', fontWeight: "bold" }, holiday: { color: '#ef4444', fontWeight: "bold" } }} modifiersClassNames={{ today: 'my-today', selected: 'my-selected' }}
              onMonthChange={handleMonthChange} selected={dayjs(selectedDate).toDate()} onSelect={showDaysOff} mode="single" className='my-styles bg-white dark:bg-gray-800 dark:text-gray-200 rounded-xl flex justify-center py-2 mx-auto max-w-lg'></DayPicker>
          </div>

          <div>
            <p className='font-semibold md:text-lg my-4'>Requests ({selectedDateRequests ? selectedDateRequests.length : 0})</p>

            {isWorkingDay ? selectedDateRequests.map((request) => <Request request={request} key={request.id} />) : ''}
          </div>
        </main>
      </div>
    </div>
  )
}

function Request({ request }) {
  return (
    <section className='flex items-center dark:text-gray-200 mb-2 pb-2 border-b border-gray-300 dark:border-gray-700'>
      <img className="h-10 w-10 rounded-full mr-2" src="https://upload.wikimedia.org/wikipedia/commons/0/09/Man_Silhouette.png" />

      <div className='flex flex-row items-end w-full justify-between md:items-center'>
        <div className='md:flex md:w-1/2 md:justify-between'>
          <p className="fullname text-sm font-semibold md:text-base">request.name</p>

          <div className='flex items-center'>
            <p className='text-sm flex mr-2'>{request.distance == 1 ? dayjs(request.start).format('D MMM') : `${dayjs(request.start).format('D MMM')} - ${dayjs(request.end).format('D MMM')}`}</p>
            <p className='distance text-sm text-gray-500 dark:text-gray-400'>(1 {(request.distance) == 1 ? "Day" : "Days"})</p>
          </div>
        </div>

        <div className='flex'>
          <p className={`${leaveTypeJson[request.type] == 'Vacation' ? 'text-[#22c55e] bg-green-100 dark:bg-green-900 dark:text-green-300' : leaveTypeJson[request.type] == 'Sick leave' ? 'text-[#f87171] bg-red-100 dark:bg-red-900 dark:text-red-300' : 'text-[#60a5fa] bg-blue-100 dark:bg-blue-900 dark:text-blue-300'} type text-xs mr-4 py-0.5 px-2 rounded-2xl w-fit`}>{leaveTypeJson[request.type]}</p>
          <p className={`${request.status == "PENDING" ? 'text-yellow-500 bg-yellow-100 dark:bg-yellow-600 dark:text-yellow-200' : request.status == "ACCEPTED" ? 'text-green-500 bg-green-200 dark:bg-green-900 dark:text-green-300' : 'text-red-500 bg-red-200  dark:bg-red-900 dark:text-red-300'} status text-xs py-0.5 px-2 rounded-2xl w-fit`}>{statusJson[request.status]}</p>
        </div>
      </div>
    </section>
  )
}