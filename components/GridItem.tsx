import type { URL_link } from '../components/MediaModal'

type GridData = {
    image: string;
    title: string;
    images: string[];
    description?: string;
    date?: string;
    method?: string
    link?: string[];
    URLs?: URL_link[];
}

type GridItemProps = {
    data: GridData;
    onOpenModal: (item: {image: string[], title?: string, description?: string, date?: string, method?: string, link?: string[], URLS?: URL_link[]}) => void;
}

export default function GridItem({data, onOpenModal}: GridItemProps) {
    return (
        <div 
            className="group relative overflow-hidden aspect-square bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => {
              setTimeout(() => {
                onOpenModal({
                  image: data.images,
                  title: data.title,
                  description: data.description ? data.description : " ",
                  date: data.date ? data.date : undefined,
                  method: data.method ? data.method : undefined,
                  link: data.link,
                  URLS: data.URLs
                })
              }, 50) 
            }}
        >
            <img src={data.image} alt={data.title} className="w-full h-full object-cover"/>

            <div className="group absolute inset-0 bg-black/10 transition-colors lg:hover:bg-black/60 duration-200 ease-linear ">
              <div className=" flex items-center flex-col justify-center 
                    absolute inset-0 opacity-100 lg:opacity-0 
                    bg-black/10
                    transition-all
                    duration-300 ease-in-out
                    bg-black/60 
                    active:opacity-0
                    lg:group-hover:opacity-100 lg:hover:bg-black/10 ">
                <h1 className="text-white text-center text-lg flex items-center justify-center ">
                    {data.title}
                </h1>
                <p className="py-[-10] text-white text-center text-sm flex items-center justify-center" >
                    {data.date ? data.date :  " "}
                </p>
                <p className="py-[-10] text-white text-center text-sm flex items-center justify-center" >
                    {data.method? "| " + data.method + " |" :  " "}
                </p>
                <p className=" text-white text-center text-xs flex items-center justify-center" >
                    - view -
                </p>
              </div>
            </div>
        </div>
    )
}