import "./CategorySection.css";

function CategorySection() {

    const categories = [

        "Pots",

        "Water Bottles",

        "Cookware",

        "Decoration",

        "Garden",

        "Kitchen"

    ];

    return (

        <section className="categories">

            <h2>Shop by Category</h2>

            <div className="category-grid">

                {

                    categories.map((item,index)=>(

                        <div key={index} className="category-card">

                            🏺

                            <h3>{item}</h3>

                        </div>

                    ))

                }

            </div>

        </section>

    );

}

export default CategorySection;