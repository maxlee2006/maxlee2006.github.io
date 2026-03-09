import MediaModal from '../components/MediaModal'
import { useState, useEffect } from 'react'

type GridData = {
    image: string;
    title: string;
    images: string[];
    description?: string;
    date?: string;
    onClick:()=>void;
}
const [openCategory, setOpenCategory] = useState<string | null>(null)
const [selectedItem, setSelectedItem] = useState<{image: string[], title?: string, description?: string, date?: string, link?: string[]} | null>(null)

const openModal = (item: {image: string[], title?: string, description?: string, date?: string, link?: string[]}) => {
    setSelectedItem(item)
  }

  const closeModal = () => {
    setSelectedItem(null)
  }

export default function GridItem({data}: {data: GridData}) {
    <div 
                  className="group relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => openModal({
                    image: data.images,
                    title: data.title,
                    description: data.description ? data.description : " ",
                    date: data .date ? data.date : " "
                  })}
                >
                  <img src= {data.image} alt="Modeling project" className="w-full h-full object-cover"/>

                  <div className="absolute inset-0  bg-black/10 transition-colors hover:bg-black/60 duration-200 ease-linear">
                    <h1 className="text-white text-lg flex items-center justify-center 
                  absolute inset-0 opacity-0 
                  transition-all
                   bg-black/60 
                  group-hover:opacity-100 hover:bg-black/10 duration-200 ease-linear">{data.title}</h1>
                  </div>
                  

    </div>
}