import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  popupForm: {
    padding: theme.spacing(2),
  },
}));

export default function SimplePopover(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  let retVal = '';

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    props.handler(retVal, props.p);
  };

  const setValue = (val) => {
    retVal = val;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <div>
      <Button
        aria-describedby={id}
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        SELL
      </Button>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <form
          noValidate
          autoComplete="off"
          className={classes.popupForm}
          onSubmit={(e) => {
            e.preventDefault();
            handleClose();
          }}
        >
          <TextField
            id="standard-basic"
            label={props.string}
            onChange={(e) => setValue(e.target.value)}
          />
        </form>
      </Popover>
    </div>
  );
}
