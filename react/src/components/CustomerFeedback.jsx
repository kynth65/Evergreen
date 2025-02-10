import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CustomerFeedback() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const testimonials = [
        {
            id: 1,
            text: "Houseplus transformed our home search into an extraordinary journey. Their attention to detail, global connections, and personalized approach led us to a property that exceeds our wildest dreams.",
            name: "Mubin Ahmed",
        },
        {
            id: 2,
            text: "Working with Houseplus made our home-buying experience seamless and enjoyable. Their expertise in understanding our vision, paired with their dedication, truly sets them apart.",
            name: "Sarah Thompson",
        },
        {
            id: 3,
            text: "The level of professionalism and personal attention we received was outstanding. They didn't just find us a house, they found us our perfect home.",
            name: "James Wilson",
        },
    ];

    const nextTestimonial = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevTestimonial = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className=" mx-auto px-4 py-16 bg-[#dae6da]">
            <h2 className="text-4xl md:text-5xl text-center mb-16 font-medium">
                What Our Client Says
            </h2>

            <div className="relative overflow-hidden">
                <div className="relative flex items-center">
                    {/* Testimonials Container */}
                    <div className="overflow-hidden w-full h-[300px]">
                        <div
                            className="flex transition-transform duration-500 ease-in-out"
                            style={{
                                transform: `translateX(-${
                                    currentIndex * 100
                                }%)`,
                            }}
                        >
                            {testimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="w-full flex-shrink-0 px-4"
                                >
                                    <div className="bg-white rounded-lg p-8 md:p-12 shadow-lg mx-2">
                                        <div className="relative">
                                            <div className="text-emerald-600 text-4xl absolute -top-4 -left-2">
                                                "
                                            </div>
                                            <div className="text-xl md:text-2xl mb-8 text-gray-700 leading-relaxed pt-4">
                                                {testimonial.text}
                                            </div>
                                            <div className="text-lg md:text-xl font-medium">
                                                {testimonial.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Navigation Arrows */}
                <div className="flex justify-center gap-8 mt-8 mb-10">
                    <button
                        onClick={prevTestimonial}
                        className="p-3 bg-white shadow-md hover:bg-gray-50 rounded-full transition-colors"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft className="w-6 h-6 text-emerald-600" />
                    </button>
                    <button
                        onClick={nextTestimonial}
                        className="p-3 bg-white shadow-md hover:bg-gray-50 rounded-full transition-colors"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight className="w-6 h-6 text-emerald-600" />
                    </button>
                </div>
            </div>
        </div>
    );
}
