
export const getProducts=()=> new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({
      products: [
        {
          id: 1,
          name: "Product 1",
          price: 100,
        },
        {
          id: 2,
          name: "Product 2",
          price: 100,
        },
        {
          id: 3,
          name: "Product 3",
          price: 100,
        },
        {
          id: 4,
          name: "Product 4",
          price: 100,
        },
      ],
    });
  }, 1000);
});

export const getProductDetails=(id)=> new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve({
      product: 
        {
          id: id,
          name: `Product ${id}`,
          price: Math.floor(Math.random()*100*id),
        },
    });
  }, 1000);
});

