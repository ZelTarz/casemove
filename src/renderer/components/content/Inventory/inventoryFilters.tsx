import { BrowserRouter as Router, Route, Link } from 'react-router-dom';
import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  ChevronDownIcon,
  DocumentDownloadIcon,
  FilterIcon,
  SearchIcon,
} from '@heroicons/react/solid';
import { useDispatch, useSelector } from 'react-redux';
import {
  filterInventoryAddOption,
  filterInventorySetSort,
  filterInventoryClearAll,
  inventoryFilterSetSearch,
} from 'renderer/store/actions/filtersInventoryActions';
import { classNames, downloadReport } from '../shared/inventoryFunctions';
import PricingAmount from '../shared/filters/pricingAmount';
const filters = {
  onlyMoveable: [
    { value: '1trade_unlock', label: 'Active tradehold' },
    { value: '1item_customname', label: 'Custom name' },
    { value: '1item_has_stickers', label: 'Stickers/Patches applied' },
    { value: '1item_moveable', label: 'Storage moveable' },
  ],
  type: [
    { value: '2characters', label: 'Agents' },
    { value: '2status_icons', label: 'Collectible & Passes' },
    { value: '2weapon_cases', label: 'Containers' },
    { value: '2music_kits', label: 'Music kits' },
    { value: '2patches', label: 'Patches' },
    { value: '2default_generated', label: 'Skins & Knives' },
    { value: '2stickers', label: 'Stickers' },
    { value: '2tools', label: 'Tools' },
  ],
  exclude: [
    { value: '3trade_unlock:', label: 'Active tradehold' },
    { value: '3econ/tools/casket', label: 'Storage Units' },
  ],
};
const sortOptions = [
  { name: 'Default' },
  { name: 'Category' },
  { name: 'Product name' },
  { name: 'QTY' },
];

function content() {
  const dispatch = useDispatch();
  const inventoryFilters = useSelector(
    (state: any) => state.inventoryFiltersReducer
  );
  const inventory = useSelector((state: any) => state.inventoryReducer);
  const pricesResult = useSelector((state: any) => state.pricingReducer);
  const settingsData = useSelector((state: any) => state.settingsReducer);

  // Update selected filter
  async function addRemoveFilter(filterValue: string) {
    dispatch(
      await filterInventoryAddOption(
        inventory.combinedInventory,
        inventoryFilters,
        filterValue
      )
    );
  }
  // Sort function
  async function onSort(Event, sortValue) {
    Event.preventDefault();
    dispatch(
      await filterInventorySetSort(
        inventory.combinedInventory,
        inventoryFilters,
        sortValue
      )
    );
  }

  async function clear_all() {
    dispatch(filterInventoryClearAll());
  }

  let inventoryToUse = [] as any;

  if (
    inventoryFilters.inventoryFiltered.length == 0 &&
    inventoryFilters.inventoryFilter.length == 0
  ) {
    inventoryToUse = inventory.combinedInventory;
  } else {
    inventoryToUse = inventoryFilters.inventoryFiltered;
  }

  // Calculate inventory amount prices
  let totalAmount = 0 as any;
  let inventoryFilter = inventoryToUse.filter(function (row) {
    if (
      row.item_name
        ?.toLowerCase()
        .trim()
        .includes(inventoryFilters.searchInput?.toLowerCase().trim())
    ) {
      return true; // skip
    }
    if (
      row.item_customname
        ?.toLowerCase()
        .trim()
        .includes(inventoryFilters.searchInput?.toLowerCase().trim())
    ) {
      return true; // skip
    }
    if (
      row.item_wear_name
        ?.toLowerCase()
        .trim()
        .includes(inventoryFilters.searchInput?.toLowerCase().trim())
    ) {
      return true; // skip
    }
    if (inventoryFilters.searchInput == undefined) {
      return true; // skip
    }
    return false;
  });
  inventoryFilter.forEach((projectRow) => {
    if (pricesResult.prices[projectRow.item_name]?.[settingsData?.source?.title]) {
      let individualPrice = projectRow.combined_QTY *
    pricesResult.prices[projectRow.item_name]?.[settingsData.source.title] * settingsData.currencyPrice[settingsData.currency]
    totalAmount += individualPrice = individualPrice ? individualPrice : 0
    }
  });
  totalAmount = totalAmount.toFixed(0);

  // Download function
  async function sendDownload() {
    console.log(inventoryFilter);
    console.log(inventoryFilters.searchInput);
    inventoryFilter.forEach((element) => {
      element['item_price'] =
        pricesResult.prices[element.item_name]?.[settingsData?.source?.title] * settingsData.currencyPrice[settingsData.currency];
      element['item_price_combined'] =
        element.combined_QTY *
        pricesResult.prices[element.item_name]?.[settingsData?.source?.title] * settingsData.currencyPrice[settingsData.currency];
    });

    downloadReport(inventoryFilter);
  }

  return (
    <div className="bg-white dark:bg-dark-level-one">
      {/* Filters */}

      <Disclosure
        as="section"
        aria-labelledby="filter-heading"
        className="relative z-10 grid items-center border-b dark:border-opacity-50"
      >
        <h2 id="filter-heading" className="sr-only">
          Filters
        </h2>
        <div className="relative col-start-1 row-start-1 py-4 flex justify-between">
          <div className=" max-w-7xl flex items-center space-x-6 divide-x divide-gray-200 text-sm px-4 sm:px-6 lg:px-8">
            <div>
              <Disclosure.Button className="group text-gray-700 font-medium flex items-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-500">
                <FilterIcon
                  className="flex-none w-5 h-5 mr-2 text-gray-400 group-hover:text-gray-500"
                  aria-hidden="true"
                />
                {inventoryFilters.inventoryFilter.length} Filters
              </Disclosure.Button>
            </div>
            <div className="pl-6">
              <Menu as="div" className="relative inline-block">
                <div className="flex">
                  <Menu.Button className="group inline-flex justify-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-400">
                    {inventoryFilters.sortValue == 'Default'
                      ? 'Sort'
                      : inventoryFilters.sortValue}
                    <ChevronDownIcon
                      className="flex-shrink-0 -mr-1 ml-1 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right absolute right-0 mt-2 w-40 rounded-md shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <Menu.Item key={option.name}>
                          {({ active }) => (
                            <Link
                              to=""
                              className={classNames(
                                option.name == inventoryFilters.sortValue
                                  ? 'font-medium text-gray-900 pointer-events-none'
                                  : 'text-gray-500',
                                active &&
                                  option.name != inventoryFilters.sortValue
                                  ? 'bg-gray-100'
                                  : '',
                                'block px-4 py-2 text-sm'
                              )}
                              onClick={(event) => onSort(event, option.name)}
                            >
                              {option.name}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
            <div className="pl-6">
              <button
                type="button"
                className="text-gray-500 dark:text-gray-400"
                onClick={() => clear_all()}
              >
                Clear all
              </button>
            </div>
            <label htmlFor="search" className="sr-only">
              Search items
            </label>
            <div className="relative rounded-md focus:outline-none focus:outline-none">
              <div
                className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                aria-hidden="true"
              >
                <SearchIcon
                  className="mr-3 h-4 w-4 text-gray-400"
                  aria-hidden="true"
                />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={inventoryFilters.searchInput}
                className="block w-full pb-0.5  focus:outline-none dark:text-dark-white pl-9 sm:text-sm border-gray-300 h-7 dark:bg-dark-level-one dark:rounded-none dark:bg-dark-level-one dark:rounded-none"
                placeholder="Search items"
                spellCheck="false"
                onChange={(e) =>
                  dispatch(inventoryFilterSetSearch(e.target.value))
                }
              />
            </div>
          </div>
          <div className="flex justify-end justify-items-end max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center divide-x divide-gray-200">
              <div className="pr-3">
                <Link
                  to=""
                  type="button"
                  onClick={() => sendDownload()}
                  className={classNames(
                    inventoryToUse.length == 0
                      ? 'pointer-events-none border-gray-100'
                      : 'hover:shadow-sm border-gray-200 ',
                    'order-1 ml-3 inline-flex items-center px-4 py-2 border dark:bg-dark-level-three dark:border-none dark:border-opacity-0 dark:text-dark-white   text-sm font-medium rounded-md text-gray-500 bg-white hover:bg-gray-50 focus:outline-none focus:bg-gray-100 sm:order-0 sm:ml-0'
                  )}
                >
                  <DocumentDownloadIcon
                    className="mr-3 h-4 w-4 text-gray-500 dark:text-dark-white"
                    aria-hidden="true"
                  />
                  Download
                </Link>
              </div>
              <div className="pl-3">
                <PricingAmount totalAmount={new Intl.NumberFormat(settingsData.locale, { style: 'currency', currency: settingsData.currency }).format(totalAmount)} />
              </div>
            </div>
          </div>
        </div>

        <Disclosure.Panel className="border-t border-gray-200 py-10">
          <div className="mx-auto grid grid-cols-1 gap-x-4 px-4 text-sm sm:px-6 md:gap-x-6 lg:px-8 ">
            <div className="grid grid-cols-1 gap-y-10 auto-rows-min md:grid-cols-3 md:gap-x-6">
              <fieldset>
                <legend className="block font-medium dark:text-dark-white">Characteristics</legend>
                <div className="pt-6 space-y-6 sm:pt-4 sm:space-y-4">
                  {filters.onlyMoveable.map((option, optionIdx) => (
                    <div
                      key={option.value}
                      className="flex items-center text-base sm:text-sm"
                    >
                      <input
                        id={`price-${optionIdx}`}
                        name="price[]"
                        type="checkbox"
                        className="flex-shrink-0 h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                        onClick={() => addRemoveFilter(option.value)}
                        checked={
                          inventoryFilters.inventoryFilter.includes(
                            option.value
                          )
                            ? true
                            : false
                        }
                        onChange={(e) => {
                          e;
                        }}
                      />
                      <label
                        htmlFor={`price-${optionIdx}`}
                        className="ml-3 min-w-0 flex-1 text-gray-600 dark:text-gray-400"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="block font-medium dark:text-dark-white">Type</legend>
                <div className="pt-6 space-y-6 sm:pt-4 sm:space-y-4">
                  {filters.type.map((option, optionIdx) => (
                    <div
                      key={option.value}
                      className="flex items-center text-base sm:text-sm"
                    >
                      <input
                        id={`type-${optionIdx}`}
                        name="type[]"
                        defaultValue={option.value}
                        type="checkbox"
                        className="flex-shrink-0 h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                        onClick={() => addRemoveFilter(option.value)}
                        checked={
                          inventoryFilters.inventoryFilter.includes(
                            option.value
                          )
                            ? true
                            : false
                        }
                        onChange={(e) => {
                          e;
                        }}
                      />
                      <label
                        htmlFor={`type-${optionIdx}`}
                        className="ml-3 min-w-0 flex-1 text-gray-600 dark:text-gray-400"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="block font-medium dark:text-dark-white">Exclude</legend>
                <div className="pt-6 space-y-6 sm:pt-4 sm:space-y-4">
                  {filters.exclude.map((option, optionIdx) => (
                    <div
                      key={option.value}
                      className="flex items-center text-base sm:text-sm"
                    >
                      <input
                        id={`exclude-${optionIdx}`}
                        name="exclude[]"
                        defaultValue={option.value}
                        type="checkbox"
                        className="flex-shrink-0 h-4 w-4 border-gray-300 rounded text-indigo-600 focus:ring-indigo-500"
                        onClick={() => addRemoveFilter(option.value)}
                        checked={
                          inventoryFilters.inventoryFilter.includes(
                            option.value
                          )
                            ? true
                            : false
                        }
                        onChange={(e) => {
                          e;
                        }}
                      />
                      <label
                        htmlFor={`exclude-${optionIdx}`}
                        className="ml-3 min-w-0 flex-1 text-gray-600 dark:text-gray-400"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </div>
        </Disclosure.Panel>
      </Disclosure>
    </div>
  );
}

export default function InventoryFilters() {
  return (
    <Router>
      <Route path="/" component={content} />
    </Router>
  );
}
