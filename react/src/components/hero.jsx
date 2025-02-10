import HeroImage from "../assets/hero photo.jpg";

export default function Hero() {
    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 ">
            <div className="flex flex-col md:flex-row items-center gap-12">
                {/* Left Content */}
                <div className="w-full md:w-1/2 space-y-6 ">
                    <h1 className="font-grotesk text-4xl md:text-7xl font-bold text-[#2D2D2D] leading-tight">
                        Be a Farm Land
                        <br />
                        Owner.
                    </h1>

                    <p className="text-lg text-gray-700 max-w-xl w-130">
                        We specialize in buying and selling premium farmland
                        properties. With a deep commitment to nature and our
                        clients, we help you find the perfect piece of land
                        while preserving our natural heritage.
                    </p>

                    {/* Email Input and Button */}
                    <div className="space-y-4 max-w-md mt-30">
                        <button className="w-full bg-[#278336] text-white py-3 px-6 rounded-lg hover:bg-green-500 transition-colors">
                            Book an Appointment
                        </button>
                        <p className="text-sm text-gray-600">
                            By clicking 'Book an Appointment' you acknowledge
                            that you have read and agree to the{" "}
                            <a
                                href="#"
                                className="underline hover:text-gray-900"
                            >
                                Terms of Service
                            </a>
                        </p>
                    </div>
                </div>

                {/* Right Content - Supplier Card */}
                <div className="w-full md:w-1/2">
                    <div className="relative">
                        <img
                            src={HeroImage}
                            alt="Solar Panel Farm"
                            className="w-full rounded-lg shadow-xl"
                        />
                        {/* Supplier Snapshot Card */}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-sm">
                            <div className="text-sm font-medium mb-4 text-white bg-green-700 w-full px-10 py-2">
                                Location
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="font-medium">Norzagaray</div>
                                <div className="text-sm text-gray-600">
                                    Bulacan
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
