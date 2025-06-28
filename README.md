
# Easy Installation Guide for openIMIS Frontend

Follow these steps to set up the openIMIS frontend on your computer:
1.  **Download the Code**
    -   Clone the repository to your computer. This creates a folder called openimis-fe_js.
2.  **Install Node.js**
    -   Download and install Node.js (version 16.x) from the official website.
3.  **Install Yarn**
    -   Install Yarn, a tool for managing project dependencies, by following the instructions on the Yarn website.
4.  **Navigate to the Project Folder**
    -   Open a terminal and go to the openimis-fe_js folder using the command: cd openimis-fe_js.
5.  **Set Up Configuration**
    -   Inside the openimis-fe_js folder, run yarn load-config to generate the necessary module dependencies and language settings. If you have a specific configuration file, use yarn load-config openimis.json.
6.  **Install Dependencies**
    -   Run yarn install to download all the technical dependencies required for openIMIS.
7.  **Start the Frontend**
    -   Launch the openIMIS frontend in development mode by running yarn start. This will start the application, and you can view it in your web browser.


## Guide to Editing an openIMIS Module (e.g., @openimis/fe-claim)
Before modifing existing openimis module , first we have to make sure that the repository is forked by HABTech repository.
Follow these steps to modify an existing openIMIS module, such as @openimis/fe-claim:
1.  **Clone the Module Repository**
    -   Clone the module's git repository (e.g., openimis-fe-claim_js) to a location **next to** (not inside) the openimis-fe_js folder.
    -   Create a new git branch for your changes to keep your work separate.
2.  **Set Up the Module**
    -   Open a terminal and navigate to the module folder (e.g., cd openimis-fe-claim_js).
    -   Install the module's dependencies by running: yarn install.
    -   Build the current development version of the module: yarn build.
    -   Create a linkable version of your local module: yarn link.
3.  **Link the Module to openIMIS**
    -   Navigate to the openimis-fe_js folder in a terminal (e.g., cd ../openimis-fe_js).
    -   Remove the existing packaged version of the module: yarn remove @openimis/fe-claim.
    -   Link your local version of the module: yarn link "@openimis/fe-claim".
Now, your local module changes will be used in the openIMIS frontend for development and testing!

## Reloading an openIMIS Module for development

To see your changes to the module (e.g., @openimis/fe-claim) reflected in the main openIMIS application, you can run yarn start from within the module's repository (e.g., openimis-fe-claim_js). This command starts a development server for the module, which automatically rebuilds and updates the module whenever you make changes, allowing the main openimis-fe_js application to reload and use the updated module in real-time.

## Key Points to Check 

-   **Ensure Only One Local Link**: Only one version of a module (e.g., @openimis/fe-claim) can be linked locally at a time. Running yarn link for a module with the same name from multiple directories will cause conflicts, as Yarn cannot manage duplicate module names.
-   **Use NVM for node version management**: We might have several local projects that require different versions of Node.js. Using NVM (Node Version Manager) allows for seamless switching between Node.js versions for each project.
