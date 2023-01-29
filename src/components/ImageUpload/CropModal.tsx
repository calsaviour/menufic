import type { FC } from "react";
import { useCallback, useState } from "react";

import type { ModalProps } from "@mantine/core";
import { Box, Button, createStyles, Group, Slider, Stack, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import type { Area, Point } from "react-easy-crop";
import Cropper from "react-easy-crop";

import { getCroppedImg } from "src/utils/helpers";

import { Modal } from "../Modal";

interface Props extends ModalProps {
    /** Aspect ratio to be used when cropping */
    aspect?: number;
    /** Path of the image to be cropped */
    imageUrl: string;
    /** Callback to be fired once cropping is complete */
    onCrop: (imageBlob: Blob) => void;
}

const useStyles = createStyles((theme) => ({
    cropArea: { borderRadius: theme.radius.lg },
    cropAreaWrap: {
        borderRadius: theme.radius.lg,
        height: 400,
        marginBottom: theme.spacing.md,
        overflow: "hidden",
        position: "relative",
        width: "100%",
    },
}));

/** Modal to allow the user to zoom & crop the uploading image into appropriate aspect ratio */
export const CropModal: FC<Props> = ({ imageUrl, onCrop, aspect = 1, onClose, ...rest }) => {
    const { classes, theme } = useStyles();
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const { mutate, isLoading: cropping } = useMutation(getCroppedImg, {
        mutationKey: [],
        onSuccess: (croppedImage) => {
            if (croppedImage) {
                onCrop(croppedImage);
            }
        },
    });

    const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
        setCroppedAreaPixels(croppedPixels);
    }, []);

    const finishCropImage = useCallback(async () => {
        if (croppedAreaPixels) {
            mutate({ imageSrc: imageUrl, pixelCrop: croppedAreaPixels, rotation });
        }
    }, [croppedAreaPixels, rotation, imageUrl, onCrop]);

    return (
        <Modal centered loading={cropping} onClose={onClose} size="lg" title="Crop Image" {...rest}>
            <Stack spacing="md">
                <Box className={classes.cropAreaWrap}>
                    <Cropper
                        aspect={aspect}
                        classes={{ cropAreaClassName: classes.cropArea }}
                        crop={crop}
                        image={imageUrl}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onRotationChange={setRotation}
                        onZoomChange={setZoom}
                        rotation={rotation}
                        zoom={zoom}
                    />
                </Box>
                <Box>
                    <Text color={theme.black}>Zoom</Text>
                    <Slider label="Zoom" max={3} min={1} onChange={setZoom} step={0.1} value={zoom} />
                </Box>
                <Box>
                    <Text color={theme.black}>Rotation</Text>
                    <Slider label="Rotation" max={360} min={0} onChange={setRotation} step={1} value={rotation} />
                </Box>
            </Stack>

            <Group mt="md" position="right">
                <Button disabled={cropping} onClick={onClose} variant="subtle">
                    Cancel
                </Button>
                <Button loading={cropping} onClick={finishCropImage}>
                    Crop
                </Button>
            </Group>
        </Modal>
    );
};