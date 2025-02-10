import Matictic from "../assets/Matictic.png";
import SanMateo from "../assets/San Mateo Land.png";

export default function PropertyHighlight() {
    return (
        <>
            <div className="bg-[#384438]">
                <div className="text-4xl md:text-5xl text-center font-grotesk font-bold text-white pt-10">
                    Available Lands
                </div>
                <section className="h-screen">
                    <div className="max-w-7xl mx-auto px-6 h-full">
                        <div className="flex flex-col md:flex-row items-center gap-12 h-full py-8">
                            {/* Left Content - Image */}
                            <div className="w-full md:w-2/3">
                                <div className="h-[70vh] md:h-[80vh] relative">
                                    {/* Price Tag */}
                                    <div className="absolute top-4 left-4 bg-white px-6 py-3 rounded-lg shadow-lg z-10">
                                        <p className="text-xl font-bold text-[#384438]">
                                            ₱5,000 Per Month Only!
                                        </p>
                                    </div>
                                    <img
                                        src={Matictic}
                                        alt="Norzagaray Property"
                                        className="w-full h-full object-cover rounded-lg shadow-xl"
                                    />
                                </div>
                            </div>

                            {/* Rest of the Matictic content remains the same */}
                            <div className="w-full md:w-1/3 space-y-8">
                                <h2 className="font-grotesk text-4xl md:text-5xl font-bold leading-tight text-white">
                                    Matictic, Norzagaray
                                </h2>

                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-8 border border-white/20">
                                    <div>
                                        <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                            Land Area
                                        </h3>
                                        <p className="text-xl font-medium text-white">
                                            500 sq.m.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                            Features
                                        </h3>
                                        <ul className="space-y-3 text-lg text-white">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                Complete Documents
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                Flat Land
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                Water and electricity ready
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                Ideal for private rest
                                                house/small farming
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                Ready for development
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                            Location
                                        </h3>
                                        <p className="text-xl font-medium text-white">
                                            Matictic, Norzagaray
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Second Property - San Mateo */}
                <section className="h-screen">
                    <div className="max-w-7xl mx-auto px-6 h-full">
                        <div className="flex flex-col md:flex-row-reverse items-center gap-12 h-full py-8">
                            {/* Right Content - Image */}
                            <div className="w-full md:w-2/3">
                                <div className="h-[70vh] md:h-[80vh] relative">
                                    {/* Price Tag */}
                                    <div className="absolute top-4 left-4 bg-white px-6 py-3 rounded-lg shadow-lg z-10">
                                        <p className="text-xl font-bold text-[#384438]">
                                            ₱9,000 Per Month Only!
                                        </p>
                                    </div>
                                    <img
                                        src={SanMateo}
                                        alt="San Mateo Property"
                                        className="w-full h-full object-cover rounded-lg shadow-xl"
                                    />
                                </div>
                            </div>

                            {/* Left Content - Property Information */}
                            <div className="w-full md:w-1/3 space-y-8">
                                <h2 className="font-grotesk text-4xl md:text-5xl font-bold leading-tight text-white">
                                    San Mateo, Norzagaray
                                </h2>

                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 space-y-8 border border-white/20">
                                    <div>
                                        <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                            Land Area
                                        </h3>
                                        <p className="text-xl font-medium text-white">
                                            1,000 sq.m.
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                            Features
                                        </h3>
                                        <ul className="space-y-3 text-lg text-white">
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                Complete Documents
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                                Ready for development
                                            </li>
                                        </ul>
                                    </div>

                                    <div>
                                        <h3 className="text-sm text-gray-300 mb-2 uppercase tracking-wider">
                                            Location
                                        </h3>
                                        <p className="text-xl font-medium text-white">
                                            San Mateo, Norzagaray
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
