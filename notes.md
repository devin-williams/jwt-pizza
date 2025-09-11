# Learning notes

## JWT Pizza code study and debugging

As part of `Deliverable ⓵ Development deployment: JWT Pizza`, start up the application and debug through the code until you understand how it works. During the learning process fill out the following required pieces of information in order to demonstrate that you have successfully completed the deliverable.

| User activity                                       | Frontend component      | Backend endpoints                                  | Database SQL                                               |
| --------------------------------------------------- | ----------------------- | -------------------------------------------------- | ---------------------------------------------------------- |
| View home page                                      | home.tsx                | n/a                                                | n/a                                                        |
| Register new user<br/>(t@jwt.com, pw: test)         | register.tsx            | authRouter.post("/")                               | addUser(user), loginUser(user)                             |
| Login new user<br/>(t@jwt.com, pw: test)            | login.tsx               | authRouter.put("/")                                | getUser(user), loginUser(user)                             |
| Order pizza                                         | menu.tsx                | POST '/api/order'                                  | addDinerOrder(user, order)                                 |
| Verify pizza                                        | delivery.tsx            | pizzaFactoryUrl + '/api/order/verify', 'POST',;    | n/a                                                        |
| View profile page                                   | dinerDashboard.tsx      | GET 'api/order'                                    | getOrders(user, page)                                      |
| View franchise<br/>(as diner)                       | franchinseDashboard.tsx | GET 'api/franchise/:userId'                        | getFranchise(franchise)                                    |
| Logout                                              | logout.tsx              | DELETE 'api/auth'                                  | logoutUser(token)                                          |
| View About page                                     | about.tsx               | n/a                                                | n/a                                                        |
| View History page                                   | history.tsx             | n/a                                                | n/a                                                        |
| Login as franchisee<br/>(f@jwt.com, pw: franchisee) | login.tsx               | PUT 'api/auth'                                     | getUser(user), loginUser(user)                             |
| View franchise<br/>(as franchisee)                  | franchiseDashboard.tsx  | GET 'api/franchise/:userId'                        | getFranchise(franchise)                                    |
| Create a store                                      | createStore.tsx         | POST 'api/franchise/:franchiseId/store'            | getFranchise(franchise), createStore(franchiseId, store)   |
| Close a store                                       | closeStore.tsx          | DELETE 'api/franchise/:franchiseId/store/:storeId' | getFranchise(franchise), deleteStore(franchiseId, storeId) |
| Login as admin<br/>(a@jwt.com, pw: admin)           | login.tsx               | PUT 'api/auth'                                     | getUser(user), loginUser(user)                             |
| View Admin page                                     | adminDashboard.tsx      | GET '/api/franchise?page=0&limit=10&name=\*'       | getFranchises(authUser, page, limit, nameFilter)           |
| Create a franchise for t@jwt.com                    | createFranchise.tsx     | POST 'api/franchise'                               | createFranchise(franchise)                                 |
| Close the franchise for t@jwt.com                   | closeFranchise.tsx      | DELETE 'api/franchise/:franchiseId'                | deleteFranchise(franchiseId)                               |
