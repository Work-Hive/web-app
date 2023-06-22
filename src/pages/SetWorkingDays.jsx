import { useState } from "react";
import { useForm } from "react-hook-form"
import { useNavigate } from 'react-router-dom'
import doFetch from '../httpService.js'
import { ChevronLeftIcon } from "@heroicons/react/24/outline"
import { weekDays } from "../constants/index.js";

export default function ChangePassword() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()

  const [errorMessage, setErrorMessage] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const goBack = () => navigate('/setting');

  const onSubmit = (data) => {
    setWorkingDays(data);
  }

  const setWorkingDays = (data) => {
    let payload = {
      startDay: data.startDay,
      weekDays: data.weekDays,
    }
    setIsProcessing(true);

    console.log(payload)
    doFetch('http://localhost:8080/organization/default', {
      method: 'POST',
      body: JSON.stringify(payload),
    }).then(data => {
      setIsProcessing(false);
      console.log('Success:', data)
    }).catch(error => {
      setIsProcessing(false);
      console.error('Error:', error);
      setErrorMessage(error.error)
    })
  }


  return (
    <div className='md:w-5/6 overflow-y-auto mb-2 w-full fixed top-16 md:top-0 bottom-0 right-0 bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-200 h-screen'>
      <div className='pt-5 p-4 md:mx-auto md:w-full md:max-w-5xl'>
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <button onClick={goBack}>
            <ChevronLeftIcon className='w-5 h-5 mr-4'></ChevronLeftIcon>
          </button>
          <h1 className="md:text-lg font-semibold text-gray-900 dark:text-gray-300">Set Company Working Days</h1>
        </div>

        {errorMessage && <p className="mb-4 text-center text-red-500 py-2 font-semibold text-sm">{errorMessage}</p>}

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className='w-full'>
            <label className="block text-sm font-semibold md:text-base leading-6 mb-2" htmlFor="startDay">Week starting day</label>
            <select {...register("startDay", { required: "Week starting day is required" })} aria-invalid={errors.startDay ? "true" : "false"} name="startDay"
              className="block w-full rounded-md border dark:border-gray-700 border-gray-200 py-1.5 shadow-sm placeholder:text-gray-600 dark:text-gray-200 sm:text-sm sm:leading-6 dark:bg-gray-800 px-2">
              <option value="">Choose week starting day</option>
              {weekDays.map((day) => <option value={day.day} key={day.day}>{day.day}</option>)}
            </select>
            {errors.startDay && <Alert>{errors.startDay.message}</Alert>}
          </div>

          <div>
            <label htmlFor="weekDays" className="block text-sm font-semibold leading-6 md:text-base mb-2">Working Days</label>
            {weekDays.map((day) => <div key={day.day} className="flex items-center mb-1">
              <input {...register("weekDays", { required: "Working days is required" })} aria-invalid={errors.weekDays ? "true" : "false"}
                value={day.day} name="weekDays" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 mr-2" />
              <span className="text-sm md:text-base">{day.day}</span>
            </div>)}
            {errors.weekDays && <Alert>{errors.weekDays.message}</Alert>}
          </div>

          <button type="submit" className="flex w-full justify-center rounded-md bg-indigo-600 py-2 px-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            {isProcessing ? "Waiting ..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  )
}

function Alert({ children }) {
  return (
    <p className="text-sm font-medium leading-6 text-red-900 mt-2" role="alert">{children}</p>
  )
}