import * as React from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { useNavigate } from 'react-router-dom';
import myFetch from './fetcher';
import ListingDetails from './ListingDetail';
import PropTypes from 'prop-types';

const columns = [
  { id: 'content', label: 'Content', minWidth: 500 },
];

ListingsDisplay.propTypes = {
  searchString: PropTypes.string,
  setSearchString: PropTypes.func,
  minBedrooms: PropTypes.string,
  maxBedrooms: PropTypes.string,
  minPrice: PropTypes.string,
  maxPrice: PropTypes.string,
  dateRange: PropTypes.array,
}

export default function ListingsDisplay ({ searchString, setSearchString, minBedrooms, maxBedrooms, minPrice, maxPrice, dateRange }) {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);

  React.useEffect(() => {
    myFetch('GET', 'listings', null)
      .then((data) => {
        const IdList = [];
        for (const row of data.listings) {
          const title = row.title.toLowerCase();
          const city = row.address.city.toLowerCase();
          let textString = null;
          if (searchString !== undefined) textString = searchString.toLowerCase();
          if (title.startsWith(textString) || searchString === '' || city.startsWith(textString)) IdList.push(row.id)
        }
        Promise.all(IdList.map(id => myFetch('GET', 'listings/' + id, null))).then(responses =>
          Promise.all(responses.map(res => res.listing))
        ).then(data => {
          const newRow = [];
          let idIndex = 0;
          let minBed = null;
          let maxBed = null;
          let minPri = null;
          let maxPri = null;
          let dateCheck = false;
          for (const res of data) {
            if (minBedrooms === null) minBed = 0;
            else minBed = Number(minBedrooms);
            if (maxBedrooms === null) maxBed = Object.keys(res.metadata.bedrooms).length;
            else maxBed = Number(maxBedrooms);
            if (minPrice === null) minPri = 0;
            else minPri = Number(minPrice);
            if (maxPrice === null) maxPri = res.price;
            else maxPri = Number(maxPrice);
            for (const date in res.availability) {
              dateCheck = false;
              const firstDate = new Date(res.availability[date].start);
              const lastDate = new Date(res.availability[date].end);
              if (dateRange[0] >= firstDate && dateRange[1] <= lastDate && dateRange[0] !== null && dateRange[1] !== null) dateCheck = true;
              if (dateRange[0] === null || dateRange[1] === null) dateCheck = true;
            }
            if (res.published && Object.keys(res.metadata.bedrooms).length >= minBed &&
              Object.keys(res.metadata.bedrooms).length <= maxBed &&
              Number(res.price) >= minPri &&
              Number(res.price) <= maxPri &&
              dateCheck === true) {
              newRow.push({
                content: <>
                  <img src={res.thumbnail} style={{ width: '50%', height: '50vh' }} />
                  <ListingDetails title={res.title} reviews={res.reviews} price={res.price} ></ListingDetails>
                </>,
                code: IdList[idIndex],
                title: res.title,
              })
            }
            idIndex++;
          }
          const sortedRows = newRow;
          sortedRows.sort(function (a, b) {
            return a.title.localeCompare(b.title);
          })
          setRows(sortedRows)
        })
      })
  })

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleRowClick = useNavigate();

  const [cursor, setCursor] = React.useState('crosshair');

  const handleRowHover = () => {
    setCursor(() => {
      return 'pointer';
    })
  }

  const editRoute = (id) => {
    handleRowClick('../listings/' + id, { replace: true })
  }

  return (
    <Paper sx={{ width: '100%', position: 'absolute', bottom: '0px', height: '92vh' }}>
      <TableContainer sx={{ height: '92%' }}>
        <Table stickyHeader aria-label="sticky table">
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.code}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        column.id === 'content'
                          ? <TableCell key={column.id} align={column.align} onClick={() => editRoute(row.code)}
                              onMouseEnter={() => handleRowHover()} style={{ cursor: cursor }}
                            >
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                            </TableCell>
                          : <TableCell key={column.id} align={column.align}>
                            {column.format && typeof value === 'number'
                              ? column.format(value)
                              : value}
                            </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}
