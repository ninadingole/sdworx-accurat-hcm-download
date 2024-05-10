# SDWorx Accurat HCM File Downloads

This repository contains the Accurat HCM file downloads for the SDWorx Accurat HCM application.

It will download the files from the SDWorx Accurat HCM application and store them in the `files` folder.
This repository will automatically download the files on the 2nd day of the every month.

Github Actions will run the workflow on the 2nd day of every month at 00:00 UTC. GHA will automatically create a commit for
newly downloaded files

## How to use

1. Fork this repository and make sure to keep it private. (Because the files contain sensitive information)
2. Go to the `Settings` tab of the repository.
3. Go to `Secrets` and add the following secrets:
   - `HCM_PASSWORD`: Your SDWorx Accurat HCM username.
   - `HCM_USERNAME`: Your SDWorx Accurat HCM password.
4. Go to `Variables` and add the following variables:
   - `BASEURL`: The URL of the SDWorx Accurat HCM application. eg: `https://hcm3.accurat.net/D12345A`
5. Go to the `Actions` tab of the repository and enable the workflow.
6. The workflow will run on the 2nd day of every month and download the files from the SDWorx Accurat HCM application.

To manually run the workflow, go to the `Actions` tab of the repository and click on the `Run workflow` button.

## How to run locally

1. Clone the repository and navigate to the folder.
2. Install the dependencies using `npm i`.
3. Run the below command to run the workflow:
   ```bash
   BASEURL="" \
   HCMUSERNAME="" \
   HCMPASSWORD="" \
   npx playwright test ## --headed if you want to see the UI 
   ```

## Downloads

The files will be downloaded to the `files` folder.
A special file `index.json` is present in the folder that tracks the last downloaded file.

## Troubleshooting

### Download all files again

- Delete all the files in `files` folder except `index.json`.
- Reset the `index.json` file to `{"LastRecord":0}`.
- Restart the workflow.

## Improvements
- [ ] Add support for raising an issue if the HCM asks for password change after 3 months.

## Issues

If you face any issues, feel free to open an issue in the repository.

## Contributing

If you have any suggestions or improvements, feel free to open an issue or a pull request.

## License

This repository is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.

