import { dummyData } from "@/utils/dummyData";

function HomePage() {
    return (
        <section className="h-screen p-[12px] flex-1">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4">
                {
                    dummyData.map((item) => {
                        return (
                            <div key={item.id} className="flex flex-col gap-2">
                                <div className="h-40 w-full rounded-md overflow-hidden">
                                    <img src={item.thumbnail} className="h-full w-full object-cover" alt="" />
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full overflow-hidden">
                                        <img src={item.artistProfilePic} className="h-full w-full object-cover" alt="" />
                                    </div>
                                    <div>
                                        <h1>{item.name}</h1>
                                        <p>{item.artist}</p>
                                        <p>{item.uploadedOn}</p>
                                    </div>

                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </section>
    )
}

export default HomePage;